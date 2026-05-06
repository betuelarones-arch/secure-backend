# Secure Backend API - TechStore

Sistema backend robusto para la gestión de inventario de TechStore con controles de seguridad avanzados, autenticación multifactor (MFA) y autorización basada en roles y atributos (RBAC + ABAC).

## 🛠 Tech Stack

- **Runtime:** Node.js 24+
- **Framework:** Express.js
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Authentication:** JWT + bcrypt
- **MFA:** speakeasy + nodemailer (Email OTP)
- **Validation:** Zod
- **Security:** Helmet, CORS, express-rate-limit

## 📋 Características

### Autenticación
- Registro de usuarios con validación de contraseña segura
- Login con bloqueo automático tras 5 intentos fallidos
- MFA por email (código de 6 dígitos, válido por 5 minutos)
- JWT para gestión de sesiones

### Autorización
- **RBAC:** Control de acceso basado en roles (ADMIN, GERENTE, EMPLEADO, AUDITOR)
- **ABAC:** Control de acceso basado en atributos (tienda, categoría premium, etc.)
- Middleware de protección granular para endpoints

### Gestión de Datos
- CRUD completo de usuarios, roles y productos
- Asignación de roles con auditoría (`asignado_por`)
- Logs de auditoría para todas las acciones críticas

## 🚀 Instalación

1. Clona el repositorio:
```bash
git clone <repo-url>
cd semana8
```

2. Instala dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env
```
Edita `.env` con tus credenciales:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/secure_db"
JWT_SECRET="tu_jwt_secret_super_seguro"
EMAIL_USER="tu_email@gmail.com"
EMAIL_APP_PASSWORD="tu_app_password"
PORT=3000
```

4. Ejecuta las migraciones y seed:
```bash
npx prisma migrate dev
npm run seed
```

5. Inicia el servidor:
```bash
npm run dev
```

## 📁 Estructura del Proyecto

```
src/
├── modules/
│   ├── auth/           # Autenticación y MFA
│   ├── users/          # Gestión de usuarios
│   ├── roles/          # Gestión de roles (RBAC)
│   ├── products/       # Gestión de productos (ABAC)
│   └── stores/         # Gestión de tiendas
├── middlewares/
│   ├── auth.middleware.js      # Verificación JWT
│   ├── rbac.middleware.js      # Control de roles
│   ├── abac.middleware.js      # Control por atributos
│   └── errorHandler.middleware.js
├── utils/
│   ├── jwt.util.js             # Generación/verificación JWT
│   ├── mfa.util.js             # Lógica MFA
│   ├── logger.util.js          # Auditoría
│   └── validators.util.js      # Esquemas Zod
├── app.js
└── index.js
```

## 📜 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor con hot-reload |
| `npm start` | Inicia servidor en producción |
| `npx prisma studio` | Interfaz visual para la BD |
| `npx prisma migrate dev` | Ejecuta migraciones |
| `npm run seed` | Carga datos iniciales |

## 🔐 Perfiles de Usuario

| Rol | Permisos |
|-----|----------|
| **ADMIN** | Acceso total, gestión de usuarios y roles |
| **GERENTE** | Gestión de productos de su tienda, sin eliminar premium |
| **EMPLEADO** | Consulta y actualización de stock, solo productos no premium |
| **AUDITOR** | Solo lectura de todos los datos |

## 📬 Configuración de MFA por Email

Para pruebas, los códigos MFA se envían a: `betuel.arones@tecsup.edu.pe`

Configura en `.env`:
```env
EMAIL_USER="tu_email@gmail.com"
EMAIL_APP_PASSWORD="tu_app_password_de_gmail"
```

## 🌐 Endpoints Principales

### Auth
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `POST /api/auth/mfa/verify` - Verificar MFA
- `POST /api/auth/mfa/setup` - Configurar MFA
- `POST /api/auth/mfa/toggle` - Activar/desactivar MFA

### Usuarios (protegido)
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `POST /api/users/roles/assign` - Asignar rol

### Roles (protegido)
- `GET /api/roles` - Listar roles
- `POST /api/roles` - Crear rol (ADMIN)
- `DELETE /api/roles/:id` - Eliminar rol (ADMIN)

### Productos (protegido con ABAC)
- `GET /api/products` - Listar productos
- `POST /api/products` - Crear producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto

## 📄 Licencia

ISC
