# Ventanilla Digital

Sistema de gestión de solicitudes y tickets para Invest in Bogotá.

## 🚀 Características

- ✅ Autenticación con Microsoft Entra ID (Azure AD)
- ✅ Creación y gestión de tickets
- ✅ Dashboard de gestión por usuario
- ✅ Panel de Alta Gerencia con analytics
- ✅ Recordatorios automáticos de tickets próximos a vencer
- ✅ Notificaciones por correo electrónico
- ✅ Cálculo automático de SLA

## 📋 Requisitos

- Node.js 20+
- PostgreSQL
- Cuenta Microsoft Entra ID (Azure AD)

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# Configurar base de datos
npx prisma generate
npx prisma db push

# Ejecutar en desarrollo
npm run dev
```

## 📚 Documentación

- [Guía de Despliegue en Netlify](./DEPLOY_NETLIFY.md)
- [Configuración de Recordatorios Automáticos](./lib/cron-setup.md)
- [Guía de Testing](./TESTING.md)
- [Arquitectura del Proyecto](./ARCHITECTURE.md)

## 🔧 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Compilar para producción
- `npm run start` - Servidor de producción
- `npm run lint` - Ejecutar linter
- `npm test` - Ejecutar tests
- `npm run test:watch` - Ejecutar tests en modo watch
- `npm run test:coverage` - Ejecutar tests con cobertura

## 📝 Variables de Entorno

Ver `.env.example` para la lista completa de variables requeridas.

## 📄 Licencia

Privado - Invest in Bogotá
