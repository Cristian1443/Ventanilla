# 🏗️ Arquitectura del Proyecto

Este documento describe la arquitectura y organización del proyecto **Ventanilla Digital**.

## 📁 Estructura de Directorios

```
ventanilla-digital/
├── app/                    # Next.js App Router
│   ├── actions/           # Server Actions (mutaciones de datos)
│   ├── api/               # API Routes (endpoints HTTP)
│   ├── admin/             # Página de administración
│   ├── dashboard/         # Dashboard de gestión
│   └── page.tsx           # Página principal
├── components/            # Componentes React
│   └── ui/               # Componentes UI reutilizables (Shadcn)
├── lib/                  # Utilidades y helpers
│   ├── config.ts         # Configuración centralizada
│   ├── prisma.ts         # Cliente Prisma singleton
│   ├── email.ts          # Servicio de correo
│   └── sla-calculator.ts # Cálculos de SLA
├── prisma/               # Schema y migraciones
└── public/               # Archivos estáticos
```

## 🎯 Principios de Arquitectura

### 1. Separación de Responsabilidades

- **Server Actions** (`app/actions/`): Mutaciones de datos, validación, lógica de negocio
- **API Routes** (`app/api/`): Endpoints HTTP para integraciones externas o cron jobs
- **Server Components** (`app/**/page.tsx`): Renderizado en servidor, consultas de datos
- **Client Components** (`components/`): Interactividad, estado del cliente

### 2. Configuración Centralizada

- **`lib/config.ts`**: Constantes compartidas (ADMIN_EMAILS, funciones de utilidad)
- **Variables de entorno**: Configuración sensible y específica del entorno

### 3. Acceso a Datos

- **`lib/prisma.ts`**: Cliente Prisma singleton con normalización de conexión
- **Server Actions**: Mutaciones de datos con validación Zod
- **Server Components**: Consultas directas a Prisma

### 4. Seguridad

- **Middleware**: Protección de rutas y autorización
- **Server Actions**: Validación de sesión y permisos
- **API Routes**: Autenticación con NextAuth

## 📋 Flujo de Datos

### Creación de Ticket
```
Cliente (CreateTicketForm) 
  → Server Action (createTicket)
    → Validación (Zod)
    → Prisma (create)
    → Email (sendAssignmentEmail)
```

### Dashboard
```
Server Component (page.tsx)
  → Prisma (findMany)
    → Renderizado con datos
```

### Recordatorios Automáticos
```
Cron Job
  → API Route (/api/reminders)
    → Server Action (checkAndSendReminders)
      → Prisma (findMany)
      → Email (sendReminderEmail)
```

## 🔐 Autenticación y Autorización

- **NextAuth.js v5**: Autenticación con Microsoft Entra ID
- **Middleware**: Protección de rutas `/dashboard` y `/admin`
- **`lib/config.ts`**: Función `isAdmin()` centralizada
- **Server Actions**: Verificación de permisos en cada acción

## 📦 Dependencias Principales

- **Next.js 16**: Framework React con App Router
- **Prisma**: ORM para PostgreSQL
- **NextAuth.js v5**: Autenticación
- **Zod**: Validación de esquemas
- **React Hook Form**: Manejo de formularios
- **Tailwind CSS**: Estilos
- **Shadcn/UI**: Componentes UI
- **Nodemailer**: Envío de correos

## ✅ Buenas Prácticas Implementadas

1. ✅ **DRY (Don't Repeat Yourself)**: Configuración centralizada
2. ✅ **Single Responsibility**: Cada archivo tiene una responsabilidad clara
3. ✅ **Type Safety**: TypeScript en todo el proyecto
4. ✅ **Validation**: Zod para validación de datos
5. ✅ **Error Handling**: Manejo de errores consistente
6. ✅ **Security**: Headers de seguridad, validación de sesión
7. ✅ **Performance**: Server Components, singleton de Prisma

## 🚀 Mejoras Futuras Sugeridas

1. **Caché**: Implementar React Cache para consultas frecuentes
2. **Logging**: Sistema de logging estructurado
3. **Testing**: Tests unitarios y de integración
4. **Monitoreo**: Integración con servicios de monitoreo
5. **Documentación API**: OpenAPI/Swagger para endpoints
