# 🚀 Guía de Despliegue en Netlify

Esta guía te ayudará a desplegar tu aplicación **Ventanilla Digital** en Netlify.

## 📋 Requisitos Previos

1. **Cuenta en Netlify** (gratuita): https://netlify.com
2. **Base de datos PostgreSQL** accesible desde internet (ej: Supabase, Railway, Neon, etc.)
3. **Aplicación Azure AD** configurada con la URL de producción

---

## 🔧 Paso 1: Preparar la Base de Datos

### Opciones recomendadas:
- **Supabase** (gratis hasta 500MB): https://supabase.com
- **Neon** (gratis): https://neon.tech
- **Railway** (gratis con créditos): https://railway.app

### Después de crear la BD:
1. Ejecuta las migraciones de Prisma:
   ```bash
   npx prisma db push
   ```

---

## 🔐 Paso 2: Configurar Azure AD para Producción

1. Ve a **Azure Portal** → **App Registrations** → Tu aplicación
2. Agrega una nueva **Redirect URI**:
   ```
   https://tu-app.netlify.app/api/auth/callback/microsoft-entra-id
   ```
3. Guarda los valores de:
   - **Application (client) ID**
   - **Directory (tenant) ID**
   - **Client Secret** (crea uno nuevo si es necesario)

---

## 🌐 Paso 3: Desplegar en Netlify

### Opción A: Desde GitHub (Recomendado)

1. **Sube tu código a GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/tu-usuario/ventanilla-digital.git
   git push -u origin main
   ```

2. **En Netlify**:
   - Ve a https://app.netlify.com
   - Click en **"Add new site"** → **"Import an existing project"**
   - Conecta con GitHub y selecciona tu repositorio
   - Netlify detectará automáticamente Next.js

### Opción B: Desde la Terminal (Netlify CLI)

1. **Instala Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Inicia sesión**:
   ```bash
   netlify login
   ```

3. **Despliega**:
   ```bash
   cd ventanilla-digital
   netlify deploy --prod
   ```

---

## ⚙️ Paso 4: Configurar Variables de Entorno en Netlify

Ve a **Site settings** → **Environment variables** y agrega:

### Base de Datos
```
DATABASE_URL=postgresql://usuario:password@host:5432/database?schema=public
```

### NextAuth.js
```
AUTH_SECRET=tu-secret-aleatorio-aqui-genera-uno-con-openssl-rand-base64-32
AUTH_URL=https://tu-app.netlify.app
NEXTAUTH_URL=https://tu-app.netlify.app
```

### Microsoft Entra ID (Azure AD)
```
AUTH_MICROSOFT_ENTRA_ID_ID=tu-client-id
AUTH_MICROSOFT_ENTRA_ID_SECRET=tu-client-secret
AUTH_MICROSOFT_ENTRA_ID_TENANT_ID=tu-tenant-id
AUTH_MICROSOFT_ENTRA_ID_ISSUER=https://login.microsoftonline.com/tu-tenant-id/v2.0
```

### SMTP (Email)
```
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=tu-correo@investinbogota.org
SMTP_PASS=tu-app-password
```

### Administradores
```
ADMIN_EMAILS=pasantedesarrollo@investinbogota.org,otro-admin@investinbogota.org
```

---

## 🔑 Generar AUTH_SECRET

Ejecuta en tu terminal:
```bash
openssl rand -base64 32
```

O usa este generador online: https://generate-secret.vercel.app/32

---

## ✅ Paso 5: Verificar el Despliegue

1. Netlify ejecutará automáticamente:
   - `npm install`
   - `prisma generate` (gracias al script `postinstall`)
   - `next build`

2. Si hay errores, revisa los **Deploy logs** en Netlify

3. Una vez desplegado, prueba:
   - Login con Microsoft
   - Crear un ticket
   - Ver el dashboard

---

## 🐛 Solución de Problemas Comunes

### Error: "Prisma Client not generated"
- **Solución**: Verifica que `postinstall` esté en `package.json`
- Netlify debería ejecutarlo automáticamente

### Error: "Database connection failed"
- **Solución**: Verifica que `DATABASE_URL` esté correcta y que tu BD permita conexiones externas
- En Supabase: Ve a **Settings** → **Database** → **Connection string**

### Error: "NextAuth callback URL mismatch"
- **Solución**: Verifica que la Redirect URI en Azure AD coincida exactamente con:
  ```
  https://tu-app.netlify.app/api/auth/callback/microsoft-entra-id
  ```

### Error: "SMTP authentication failed"
- **Solución**: Usa una **App Password** de Office365, no tu contraseña normal
- Ve a: https://account.microsoft.com/security → **App passwords**

---

## 📝 Notas Importantes

1. **Prisma en Netlify**: El cliente se genera automáticamente gracias al script `postinstall`
2. **Variables de entorno**: No olvides configurar TODAS las variables antes del primer deploy
3. **Base de datos**: Asegúrate de que tu PostgreSQL tenga conexión SSL habilitada (la mayoría de servicios cloud la tienen)
4. **Dominio personalizado**: Puedes agregar uno en **Site settings** → **Domain management**

---

## 🔔 Paso 6: Configurar Recordatorios Automáticos

Para que los recordatorios de tickets se envíen automáticamente:

### Opción Recomendada: Cron-Job.org (Gratis)

1. Crea una cuenta en https://cron-job.org (gratis)
2. Crea un nuevo cron job:
   - **URL:** `https://tu-app.netlify.app/api/reminders?dias=1`
   - **Schedule:** Diariamente a las 9:00 AM (hora Colombia = 14:00 UTC)
   - **Método:** GET
3. Guarda y activa el cron job

### Alternativa: EasyCron

1. Crea cuenta en https://www.easycron.com
2. Configura similar a cron-job.org

**Nota:** Para Vercel, el archivo `vercel.json` ya está configurado y funcionará automáticamente.

Ver `lib/cron-setup.md` para más opciones y detalles.

---

## 🎉 ¡Listo!

Tu aplicación debería estar funcionando en: `https://tu-app.netlify.app`

Si necesitas ayuda, revisa los logs de Netlify o la documentación oficial:
- Netlify Next.js: https://docs.netlify.com/integrations/frameworks/nextjs/
- Prisma Deployment: https://www.prisma.io/docs/guides/deployment
- Recordatorios: Ver `lib/cron-setup.md`
