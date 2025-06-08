# MediRecord Pro - Sistema de Expediente Médico

Un sistema completo de gestión de expedientes médicos desarrollado con tecnologías web modernas.

## 🚀 Características

- **Sistema de Autenticación**: Login, registro y recuperación de contraseña
- **Roles de Usuario**: Administrador, Médico, Enfermero, Paciente
- **Expediente Médico Completo**: Historia clínica, signos vitales, medicamentos, alergias
- **Gestión de Citas**: Programación y seguimiento de citas médicas
- **Resultados de Laboratorio**: Almacenamiento y visualización de estudios
- **Dashboard Personalizado**: Interfaz específica para cada rol
- **Responsive Design**: Compatible con dispositivos móviles
- **Seguridad**: Políticas de acceso y auditoría

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Gráficos**: Chart.js
- **Iconos**: Font Awesome
- **Despliegue**: Netlify

## 📋 Requisitos Previos

- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [Netlify](https://netlify.com) (para despliegue)
- Editor de código (VS Code recomendado)

## ⚙️ Configuración

### 1. Configurar Supabase

1. Crear un nuevo proyecto en Supabase
2. Ir a Settings > API y copiar:
   - Project URL
   - Anon public key

3. Ejecutar el esquema de base de datos:
   - Ir a SQL Editor en Supabase
   - Copiar y ejecutar el contenido de `database/schema.sql`

### 2. Configurar el Proyecto

1. Clonar o descargar el proyecto
2. Editar `assets/js/supabase-config.js`:

```javascript
const SUPABASE_URL = 'TU_SUPABASE_URL'
const SUPABASE_ANON_KEY = 'TU_SUPABASE_ANON_KEY'
```

### 3. Configurar Autenticación en Supabase

1. Ir a Authentication > Settings
2. Configurar Site URL: `https://tu-dominio.netlify.app`
3. Agregar Redirect URLs:
   - `https://tu-dominio.netlify.app/pages/auth/login.html`
   - `https://tu-dominio.netlify.app/pages/dashboard/`

### 4. Configurar Políticas de Seguridad (RLS)

Las políticas ya están incluidas en el schema.sql, pero puedes revisarlas en:
Authentication > Policies

## 🚀 Despliegue en Netlify

### Opción 1: Desde GitHub

1. Subir el proyecto a GitHub
2. Conectar repositorio en Netlify
3. Configurar build settings:
   - Build command: (dejar vacío)
   - Publish directory: `/`

### Opción 2: Drag & Drop

1. Comprimir todos los archivos del proyecto
2. Arrastrar a Netlify Deploy
3. Configurar dominio personalizado (opcional)

## 📁 Estructura del Proyecto

```
medirecord-pro/
├── assets/
│   ├── css/
│   │   ├── style.css          # Estilos generales
│   │   ├── auth.css           # Estilos de autenticación
│   │   └── dashboard.css      # Estilos del dashboard
│   ├── js/
│   │   ├── supabase-config.js # Configuración de Supabase
│   │   └── auth.js            # Funciones de autenticación
│   └── img/                   # Imágenes del proyecto
├── pages/
│   ├── auth/
│   │   ├── login.html         # Página de login
│   │   ├── register.html      # Página de registro
│   │   └── reset-password.html # Recuperar contraseña
│   └── dashboard/
│       ├── admin.html         # Dashboard administrador
│       ├── doctor.html        # Dashboard médico
│       └── patient.html       # Dashboard paciente
├── components/
│   └── dashboard-layout.html  # Layout base del dashboard
├── database/
│   └── schema.sql            # Esquema de base de datos
├── index.html                # Página principal
└── README.md                 # Este archivo
```

## 👥 Roles y Permisos

### Administrador
- Gestión completa de usuarios
- Acceso a todos los expedientes
- Reportes y estadísticas
- Configuración del sistema

### Médico
- Gestión de pacientes asignados
- Crear y editar consultas
- Prescribir medicamentos
- Ordenar estudios de laboratorio

### Enfermero/a
- Registro de signos vitales
- Administración de medicamentos
- Asistencia en consultas

### Paciente
- Ver su expediente médico
- Consultar citas programadas
- Ver resultados de estudios
- Gestionar información personal

## 🔒 Seguridad

- **Autenticación**: JWT tokens con Supabase Auth
- **Autorización**: Row Level Security (RLS)
- **Auditoría**: Registro de todas las acciones
- **Encriptación**: Datos sensibles encriptados
- **HTTPS**: Comunicación segura

## 📊 Base de Datos

### Tablas Principales

- `users`: Usuarios del sistema
- `patients`: Información de pacientes
- `appointments`: Citas médicas
- `medical_consultations`: Consultas realizadas
- `medications`: Medicamentos prescritos
- `laboratory_results`: Resultados de laboratorio
- `vital_signs`: Signos vitales
- `allergies`: Alergias de pacientes

## 🎨 Personalización

### Colores del Tema

Editar variables CSS en `assets/css/style.css`:

```css
:root {
    --primary-color: #2C3E50;
    --secondary-color: #3498DB;
    --accent-color: #E74C3C;
    /* ... más colores */
}
```

### Agregar Nuevas Funcionalidades

1. Crear nuevas páginas en `pages/`
2. Agregar estilos en `assets/css/`
3. Implementar lógica en JavaScript
4. Actualizar menús de navegación

## 🐛 Solución de Problemas

### Error de Conexión a Supabase
- Verificar URL y API Key en `supabase-config.js`
- Comprobar que el proyecto de Supabase esté activo

### Problemas de Autenticación
- Verificar configuración de redirect URLs
- Comprobar políticas RLS en Supabase

### Errores de Base de Datos
- Verificar que el schema se ejecutó correctamente
- Comprobar permisos de las tablas

## 📝 Próximas Funcionalidades

- [ ] Chat en tiempo real entre personal médico
- [ ] Notificaciones push
- [ ] Integración con dispositivos médicos
- [ ] Telemedicina
- [ ] App móvil nativa
- [ ] Reportes avanzados con IA

## 🤝 Contribuir

1. Fork del proyecto
2. Crear rama para nueva funcionalidad
3. Commit de cambios
4. Push a la rama
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas:
- Email: soporte@medirecord.com
- Documentación: [docs.medirecord.com](https://docs.medirecord.com)

## 🙏 Agradecimientos

- [Supabase](https://supabase.com) por el backend
- [Chart.js](https://chartjs.org) por los gráficos
- [Font Awesome](https://fontawesome.com) por los iconos
- [Netlify](https://netlify.com) por el hosting

---

**MediRecord Pro** - Digitalizando la atención médica 🏥
