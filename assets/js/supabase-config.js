// Configuración de Supabase
const SUPABASE_URL = "https://ybfcyynuewnjtikqwuie.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliZmN5eW51ZXduanRpa3F3dWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNTI0MTUsImV4cCI6MjA2NDkyODQxNX0.noglZvOr6Z_M1N_m15PF1PkcGI9Ibi6niPI9J5R4Dg8";

// Inicializar el cliente de Supabase
// Esperar a que la librería de Supabase se cargue
let supabase;

// Función para inicializar Supabase
function initializeSupabase() {
  if (typeof window.supabase !== "undefined") {
    const { createClient } = window.supabase;
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabase = supabase;
    return true;
  }
  return false;
}

// Intentar inicializar inmediatamente
if (!initializeSupabase()) {
  // Si no está disponible, esperar a que se cargue
  window.addEventListener("load", initializeSupabase);
}

// Configuración de autenticación
const authConfig = {
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true,
};

// Manejador de errores global
const handleError = (error) => {
  console.error("Error:", error.message);
  // Aquí puedes agregar tu lógica de manejo de errores
  // Por ejemplo, mostrar una notificación al usuario
  if (error.message.includes("JWT expired")) {
    // Redirigir al login si el token expiró
    window.location.href = "/pages/auth/login.html";
  }
};

// Configuración de Storage
const storageConfig = {
  avatarBucket: "avatars",
  documentsBucket: "medical-documents",
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedFileTypes: ["image/jpeg", "image/png", "application/pdf"],
};

// Funciones de utilidad para Supabase
const supabaseHelpers = {
  // Subir archivo
  async uploadFile(bucket, file, path) {
    try {
      if (!storageConfig.allowedFileTypes.includes(file.type)) {
        throw new Error("Tipo de archivo no permitido");
      }
      if (file.size > storageConfig.maxFileSize) {
        throw new Error("Archivo demasiado grande");
      }

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file);

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
      return null;
    }
  },

  // Obtener URL pública de un archivo
  async getPublicUrl(bucket, path) {
    try {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);

      return data?.publicUrl;
    } catch (error) {
      handleError(error);
      return null;
    }
  },

  // Eliminar archivo
  async deleteFile(bucket, path) {
    try {
      const { error } = await supabase.storage.from(bucket).remove([path]);

      if (error) throw error;
      return true;
    } catch (error) {
      handleError(error);
      return false;
    }
  },
};

// Funciones de utilidad para manejo de datos
const dataHelpers = {
  // Formatear fecha para la base de datos
  formatDate(date) {
    return date.toISOString();
  },

  // Formatear fecha para mostrar
  formatDisplayDate(dateString) {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  },

  // Formatear hora para mostrar
  formatDisplayTime(dateString) {
    return new Date(dateString).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  },
};

// Configuración de notificaciones
const notificationConfig = {
  position: "top-right",
  duration: 5000,
  closable: true,
  types: {
    success: {
      backgroundColor: "#27ae60",
      color: "#ffffff",
    },
    error: {
      backgroundColor: "#e74c3c",
      color: "#ffffff",
    },
    warning: {
      backgroundColor: "#f1c40f",
      color: "#ffffff",
    },
    info: {
      backgroundColor: "#3498db",
      color: "#ffffff",
    },
  },
};

// Función para mostrar notificaciones
function showNotification(message, type = "info") {
  // Aquí puedes implementar tu sistema de notificaciones
  console.log(`${type}: ${message}`);
}

// Exportar configuración y utilidades
window.supabaseConfig = {
  client: supabase,
  auth: authConfig,
  storage: storageConfig,
  helpers: {
    ...supabaseHelpers,
    ...dataHelpers,
  },
  notifications: {
    config: notificationConfig,
    show: showNotification,
  },
};

// Verificar conexión con Supabase
async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("count")
      .limit(1);

    if (error) throw error;
    console.log("Conexión con Supabase establecida correctamente");
  } catch (error) {
    console.error("Error al conectar con Supabase:", error.message);
  }
}

// Verificar conexión al cargar la página
document.addEventListener("DOMContentLoaded", checkSupabaseConnection);
