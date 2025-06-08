// Funciones de autenticación
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.isInitialized = false;
    this.init();
  }

  async init() {
    // Esperar a que Supabase esté disponible
    const waitForSupabase = () => {
      return new Promise((resolve) => {
        const checkSupabase = () => {
          if (window.supabase) {
            resolve();
          } else {
            setTimeout(checkSupabase, 100);
          }
        };
        checkSupabase();
      });
    };

    await waitForSupabase();

    // Verificar el estado de autenticación actual sin redirigir
    const {
      data: { session },
    } = await window.supabase.auth.getSession();
    if (session) {
      this.currentUser = session.user;
    }

    // Verificar si estamos en las páginas correctas
    const isDashboard = window.location.pathname.includes("/dashboard/");
    const isAuthPage = window.location.pathname.includes("/auth/");
    const isIndexPage =
      window.location.pathname.endsWith("index.html") ||
      window.location.pathname.endsWith("/");

    // Solo redirigir si hay un problema de autenticación
    if (!session && isDashboard) {
      // No hay sesión pero estamos en dashboard - ir al login
      window.location.href = this.getProjectRoot() + "pages/auth/login.html";
      return;
    }

    // Escuchar cambios en el estado de autenticación (solo para eventos futuros)
    window.supabase.auth.onAuthStateChange((event, session) => {
      // Evitar redirecciones automáticas en la carga inicial
      if (!this.isInitialized) {
        this.isInitialized = true;
        return;
      }

      if (event === "SIGNED_IN") {
        this.currentUser = session.user;
        // Solo redirigir si estamos en una página de autenticación
        if (isAuthPage || isIndexPage) {
          this.redirectToDashboard();
        }
      } else if (event === "SIGNED_OUT") {
        this.currentUser = null;
        // Solo redirigir si no estamos ya en una página de autenticación
        if (!isAuthPage) {
          window.location.href = this.getProjectRoot() + "index.html";
        }
      }
    });

    this.isInitialized = true;
  }

  // Registro de usuario
  async signUp(email, password, userData) {
    try {
      const { data, error } = await window.supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: userData,
        },
      });

      if (error) throw error;

      // Crear perfil de usuario en la tabla users
      if (data.user) {
        await this.createUserProfile(data.user, userData);
      }

      return { success: true, data };
    } catch (error) {
      console.error("Error en registro:", error.message);
      return { success: false, error: error.message };
    }
  }

  // Inicio de sesión
  async signIn(email, password) {
    try {
      const { data, error } = await window.supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      // Redirigir manualmente después del login exitoso
      setTimeout(() => {
        this.redirectToDashboard();
      }, 100);

      return { success: true, data };
    } catch (error) {
      console.error("Error en login:", error.message);
      return { success: false, error: error.message };
    }
  }

  // Cerrar sesión
  async signOut() {
    try {
      const { error } = await window.supabase.auth.signOut();
      if (error) throw error;

      // Redirigir manualmente después del logout
      window.location.href = this.getProjectRoot() + "index.html";

      return { success: true };
    } catch (error) {
      console.error("Error al cerrar sesión:", error.message);
      return { success: false, error: error.message };
    }
  }

  // Crear perfil de usuario
  async createUserProfile(user, userData) {
    try {
      const { error } = await window.supabase.from("users").insert([
        {
          id: user.id,
          email: user.email,
          full_name: userData.full_name,
          role: userData.role || "patient",
          phone: userData.phone || "",
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;
    } catch (error) {
      console.error("Error al crear perfil:", error.message);
      throw error;
    }
  }

  // Obtener perfil de usuario
  async getUserProfile(userId) {
    try {
      const { data, error } = await window.supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error al obtener perfil:", error.message);
      return null;
    }
  }

  // Obtener ruta absoluta desde la raíz del proyecto
  getProjectRoot() {
    const currentPath = window.location.pathname;
    const projectName = "PROYECTOESME"; // Nombre de la carpeta del proyecto
    const pathParts = currentPath.split(projectName);

    if (pathParts.length > 1) {
      // Si estamos dentro del proyecto, construir la ruta base
      return window.location.origin + pathParts[0] + projectName + "/";
    }

    return window.location.origin + "/";
  }

  // Redirigir al dashboard apropiado
  async redirectToDashboard() {
    try {
      const user = await window.supabase.auth.getUser();
      if (user.data.user) {
        const profile = await this.getUserProfile(user.data.user.id);
        const rootUrl = this.getProjectRoot();

        if (profile) {
          let dashboardPath;
          switch (profile.role) {
            case "admin":
              dashboardPath = "pages/dashboard/admin.html";
              break;
            case "doctor":
              dashboardPath = "pages/dashboard/doctor.html";
              break;
            case "nurse":
              dashboardPath = "pages/dashboard/nurse.html";
              break;
            case "patient":
              dashboardPath = "pages/dashboard/patient.html";
              break;
            default:
              dashboardPath = "pages/dashboard/patient.html";
          }
          window.location.href = rootUrl + dashboardPath;
        } else {
          window.location.href = rootUrl + "pages/dashboard/patient.html";
        }
      }
    } catch (error) {
      console.error("Error al redirigir:", error.message);
      const rootUrl = this.getProjectRoot();
      window.location.href = rootUrl + "pages/dashboard/patient.html";
    }
  }

  // Recuperar contraseña
  async resetPassword(email) {
    try {
      const rootUrl = this.getProjectRoot();
      const resetUrl = rootUrl + "pages/auth/reset-password.html";

      const { error } = await window.supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: resetUrl,
        }
      );

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Error al recuperar contraseña:", error.message);
      return { success: false, error: error.message };
    }
  }

  // Validar email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validar contraseña
  isValidPassword(password) {
    return password.length >= 6;
  }
}

// Instancia global del manejador de autenticación
const authManager = new AuthManager();

// Funciones auxiliares para formularios
function showMessage(elementId, message, type = "error") {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = "block";

    // Ocultar mensaje después de 5 segundos
    setTimeout(() => {
      element.style.display = "none";
    }, 5000);
  }
}

function showLoading(buttonId, show = true) {
  const button = document.getElementById(buttonId);
  if (button) {
    if (show) {
      button.disabled = true;
      button.textContent = "Cargando...";
    } else {
      button.disabled = false;
      button.textContent =
        button.getAttribute("data-original-text") || "Enviar";
    }
  }
}
