// assets/js/auth.js

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  async init() {
    await new Promise((resolve) => {
      const check = () =>
        window.supabase ? resolve() : setTimeout(check, 100);
      check();
    });

    const {
      data: { session },
    } = await window.supabase.auth.getSession();
    if (session) {
      this.currentUser = session.user;
      if (window.location.pathname.includes("/auth/")) {
        this.redirectToDashboard();
      }
    } else {
      const isProtectedPage =
        window.location.pathname.includes("/dashboard/") ||
        window.location.pathname.includes("/patients/") ||
        window.location.pathname.includes("/records/");
      if (isProtectedPage) {
        window.location.href = this.getProjectRoot() + "pages/auth/login.html";
      }
    }

    window.supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        this.currentUser = null;
        window.location.href = this.getProjectRoot() + "index.html";
      }
    });
  }

  async resetPassword(email) {
    try {
      // ======================= INICIO DE CORRECCIÓN =======================
      // Debemos usar la URL pública de tu sitio en Netlify, no una local.
      // REEMPLAZA 'TU-DOMINIO-DE-NETLIFY.netlify.app' CON TU URL REAL.
      const resetURL =
        "https://expromedic.netlify.app/pages/auth/update-password.html";

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetURL,
      });
      // ======================= FIN DE CORRECCIÓN =======================
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error en reset password:", error.message);
      return { success: false, error: error.message };
    }
  }

  async signUp(email, password, allUserData) {
    try {
      const { data, error } = await window.supabase.auth.signUp({
        email: email,
        password: password,
        options: { data: allUserData },
      });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error en registro:", error.message);
      return { success: false, error: error.message };
    }
  }

  async signIn(email, password) {
    try {
      const { data, error } = await window.supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (error) throw error;
      await this.redirectToDashboard();
      return { success: true, data };
    } catch (error) {
      console.error("Error en login:", error.message);
      return { success: false, error: error.message };
    }
  }

  async signOut() {
    try {
      await window.supabase.auth.signOut();
    } catch (error) {
      console.error("Error al cerrar sesión:", error.message);
    }
  }

  async getUserProfile(userId) {
    try {
      const { data, error } = await window.supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error al obtener perfil:", error.message);
      return null;
    }
  }

  getProjectRoot() {
    const path = window.location.pathname;
    const pagesIndex = path.indexOf("/pages/");
    if (pagesIndex > -1) {
      return path.substring(0, pagesIndex + 1);
    }
    if (path.endsWith("/index.html")) {
      return path.substring(0, path.length - "index.html".length);
    }
    return "/";
  }

  async redirectToDashboard() {
    try {
      const {
        data: { user },
      } = await window.supabase.auth.getUser();
      if (user) {
        const profile = await this.getUserProfile(user.id);
        const rootUrl = this.getProjectRoot();
        let dashboardPath = "pages/dashboard/patient.html";
        if (profile && profile.role) {
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
            case "staff":
              dashboardPath = "pages/dashboard/staff.html";
              break;
            case "patient":
              dashboardPath = "pages/dashboard/patient.html";
              break;
          }
        }
        window.location.href = rootUrl + dashboardPath;
      }
    } catch (error) {
      console.error("Error al redirigir:", error.message);
      window.location.href =
        this.getProjectRoot() + "pages/dashboard/patient.html";
    }
  }

  // --- MÉTODOS DE VALIDACIÓN RESTAURADOS ---
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPassword(password) {
    return password.length >= 6;
  }
}
const authManager = new AuthManager();

// --- FUNCIONES AUXILIARES ---
function showMessage(elementId, message, type = "error") {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
    element.className = `message-container message ${type}`;
    element.style.display = "block";
    setTimeout(() => {
      element.style.display = "none";
    }, 5000);
  }
}

function showLoading(buttonId, show = true) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.disabled = show;
    if (show) {
      if (!button.dataset.originalText)
        button.dataset.originalText = button.textContent;
      button.textContent = "Cargando...";
    } else {
      button.textContent = button.dataset.originalText || "Enviar";
    }
  }
}

// --- INICIO DEL CÓDIGO NUEVO Y MEJORADO PARA LA UI ---

/**
 * Dibuja la barra lateral de navegación según el rol del usuario.
 * @param {string} role - El rol del usuario actual ('doctor', 'patient', etc.).
 * @param {string} currentPage - El nombre del archivo de la página actual para marcarlo como activo.
 */
function renderSidebar(role, currentPage) {
  const menuContainer = document.getElementById("navMenu");
  if (!menuContainer) return;

  // Plantilla central de todos los enlaces para cada rol
  const menuLinks = {
    doctor: [
      { href: "../dashboard/doctor.html", icon: "fa-home", text: "Dashboard" },
      {
        href: "../patients/index.html",
        icon: "fa-user-injured",
        text: "Mis Pacientes",
      },
      {
        href: "../appointments/index.html",
        icon: "fa-calendar-alt",
        text: "Citas",
      },
      {
        href: "../consultations/index.html",
        icon: "fa-stethoscope",
        text: "Consultas",
      },
      {
        href: "../prescriptions/index.html",
        icon: "fa-prescription-bottle-alt",
        text: "Recetas",
      },
      {
        href: "../laboratory/index.html",
        icon: "fa-flask",
        text: "Laboratorio",
      },
      { href: "../profile/index.html", icon: "fa-user", text: "Mi Perfil" },
    ],
    patient: [
      { href: "../dashboard/patient.html", icon: "fa-home", text: "Inicio" },
      {
        href: "../records/my-record.html",
        icon: "fa-folder-open",
        text: "Mi Expediente",
      },
      {
        href: "../appointments/my-appointments.html",
        icon: "fa-calendar-alt",
        text: "Mis Citas",
      },
      {
        href: "../results/index.html",
        icon: "fa-file-medical-alt",
        text: "Resultados",
      },
      {
        href: "../medications/my-medications.html",
        icon: "fa-pills",
        text: "Medicamentos",
      },
      { href: "../profile/index.html", icon: "fa-user", text: "Mi Perfil" },
    ],
    nurse: [
      { href: "../dashboard/nurse.html", icon: "fa-home", text: "Dashboard" },
      {
        href: "../patients/index.html",
        icon: "fa-user-injured",
        text: "Pacientes",
      },
      {
        href: "../laboratory/index.html",
        icon: "fa-flask",
        text: "Laboratorio",
      },
      { href: "../profile/index.html", icon: "fa-user", text: "Mi Perfil" },
    ],
    admin: [
      { href: "../dashboard/admin.html", icon: "fa-home", text: "Dashboard" },
      { href: "../users/index.html", icon: "fa-users", text: "Usuarios" },
      { href: "../reports/index.html", icon: "fa-chart-bar", text: "Reportes" },
      { href: "../profile/index.html", icon: "fa-user", text: "Mi Perfil" },
    ],
  };

  const items = menuLinks[role] || menuLinks.patient; // Menú de paciente por defecto
  menuContainer.innerHTML = items
    .map((item) => {
      // Comprueba si el final de la ruta actual coincide con el href del item
      const isActive =
        currentPage && item.href.endsWith(currentPage) ? "active" : "";
      return `<a href="${item.href}" class="nav-item ${isActive}"><i class="fas ${item.icon}"></i><span>${item.text}</span></a>`;
    })
    .join("");
}

/**
 * Inicializa el perfil de usuario en el encabezado.
 * @param {Object} userProfile - El perfil completo del usuario desde la tabla 'users'.
 */
function initializeHeader(userProfile) {
  const userNameSpan = document.getElementById("userName");
  const userInitialsDiv = document.getElementById("userInitials");
  if (!userNameSpan || !userInitialsDiv) return;

  const fullName = userProfile.full_name || "Usuario";
  userNameSpan.textContent = fullName;
  userInitialsDiv.textContent = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

/**
 * Añade la funcionalidad para mostrar/ocultar el menú de usuario.
 */
function initializeUserMenu() {
  const userProfileDiv = document.querySelector(".user-profile");
  if (!userProfileDiv) return;

  let userMenuVisible = false;

  const toggleUserMenu = () => {
    userMenuVisible = !userMenuVisible;
    const existingMenu = document.querySelector(".user-dropdown-menu");
    if (existingMenu) {
      existingMenu.remove();
      return;
    }
    if (userMenuVisible) {
      const menu = document.createElement("div");
      menu.className = "user-dropdown-menu";
      menu.innerHTML = `
                <a href="${authManager.getProjectRoot()}pages/profile/index.html" class="user-menu-item"><i class="fas fa-user"></i> Mi Perfil</a>
                <div class="user-menu-item" onclick="authManager.signOut()"><i class="fas fa-sign-out-alt"></i> Cerrar Sesión</div>
            `;
      userProfileDiv.appendChild(menu);
    }
  };

  userProfileDiv.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleUserMenu();
  });

  document.addEventListener("click", () => {
    if (userMenuVisible) {
      toggleUserMenu();
    }
  });
}

function toggleSidebar() {
  document.getElementById("sidebar")?.classList.toggle("collapsed");
}
