# 🔔 Configuración de Recordatorios Automáticos

Este documento explica cómo configurar los recordatorios automáticos de tickets en diferentes plataformas.

## 📋 ¿Qué hace el sistema?

El sistema envía automáticamente correos de recordatorio a los responsables de tickets que están próximos a vencer (por defecto, 1 día antes de la fecha de compromiso).

## 🚀 Configuración por Plataforma

### Opción 1: Vercel (Recomendado para Next.js)

Si despliegas en Vercel, el archivo `vercel.json` ya está configurado. El cron se ejecutará automáticamente todos los días a las 9:00 AM (hora del servidor).

**No necesitas hacer nada adicional** - Vercel detectará automáticamente el archivo `vercel.json` y configurará el cron job.

### Opción 2: Netlify

Si despliegas en Netlify, necesitas:

1. **Instalar el plugin de scheduled functions:**
   ```bash
   npm install --save-dev @netlify/plugin-scheduled-functions
   ```

2. **El archivo `netlify.toml` ya está configurado** con el cron job.

3. **Asegúrate de que el API route esté accesible:**
   - El endpoint `/api/reminders?dias=1` debe estar disponible
   - Netlify ejecutará la función según el schedule configurado

### Opción 3: Servidor Propio / VPS

Si tienes un servidor propio, puedes usar `cron` del sistema o un servicio externo:

#### Opción A: Cron del Sistema (Linux/Mac)

1. Crea un script que llame a tu API:
   ```bash
   # /usr/local/bin/ventanilla-reminders.sh
   curl -X GET "https://tu-dominio.com/api/reminders?dias=1"
   ```

2. Haz el script ejecutable:
   ```bash
   chmod +x /usr/local/bin/ventanilla-reminders.sh
   ```

3. Agrega al crontab (ejecuta `crontab -e`):
   ```
   # Ejecutar todos los días a las 9:00 AM
   0 9 * * * /usr/local/bin/ventanilla-reminders.sh
   ```

#### Opción B: Servicio Externo (Cron-Job.org, EasyCron, etc.)

1. Crea una cuenta en un servicio de cron online
2. Configura una tarea que llame a:
   ```
   GET https://tu-dominio.com/api/reminders?dias=1
   ```
3. Programa la ejecución diaria (ej: 9:00 AM hora Colombia)

### Opción 4: Usar node-cron (Desarrollo/Testing)

Para desarrollo local o servidores Node.js:

1. **Instala node-cron:**
   ```bash
   npm install node-cron
   ```

2. **Crea un archivo `scripts/start-cron.ts`:**
   ```typescript
   import cron from "node-cron";
   import { checkAndSendReminders } from "../app/actions/checkReminders";

   // Ejecutar todos los días a las 9:00 AM
   cron.schedule("0 9 * * *", async () => {
     console.log("[Cron] Ejecutando verificación de recordatorios...");
     try {
       const resultados = await checkAndSendReminders(1);
       console.log(`[Cron] ${resultados.enviados} recordatorios enviados`);
     } catch (error) {
       console.error("[Cron] Error:", error);
     }
   });

   console.log("[Cron] Recordatorios programados para las 9:00 AM diariamente");
   ```

3. **Ejecuta en tu servidor:**
   ```bash
   tsx scripts/start-cron.ts
   ```

## ⚙️ Configuración de Horario

El cron está configurado para ejecutarse a las **9:00 AM** (hora del servidor). Para cambiar el horario:

### Formato Cron: `minuto hora día mes día-semana`

Ejemplos:
- `0 9 * * *` - Todos los días a las 9:00 AM
- `0 8 * * 1-5` - Lunes a Viernes a las 8:00 AM
- `0 14 * * *` - Todos los días a las 2:00 PM (14:00)
- `0 9,17 * * *` - Dos veces al día: 9:00 AM y 5:00 PM

### Ajustar para Zona Horaria de Colombia

Colombia está en UTC-5. Si tu servidor está en UTC:
- 9:00 AM Colombia = 14:00 UTC → `0 14 * * *`

## 🔍 Verificar que Funciona

1. **Prueba manualmente:**
   ```bash
   curl https://tu-dominio.com/api/reminders?dias=1
   ```

2. **Revisa los logs:**
   - Vercel: Dashboard → Functions → Logs
   - Netlify: Site settings → Functions → Logs
   - Servidor propio: Revisa los logs de tu aplicación

3. **Verifica los correos:**
   - Los responsables deberían recibir correos de recordatorio
   - Revisa la bandeja de entrada y spam

## 📧 Personalizar Días de Anticipación

Para cambiar cuántos días antes se envían los recordatorios:

- **1 día antes (default):** `?dias=1`
- **2 días antes:** `?dias=2`
- **3 días antes:** `?dias=3`

Puedes configurar múltiples cron jobs para diferentes anticipaciones:
```json
{
  "crons": [
    {
      "path": "/api/reminders?dias=3",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/reminders?dias=1",
      "schedule": "0 9 * * *"
    }
  ]
}
```

## 🛠️ Troubleshooting

### El cron no se ejecuta

1. Verifica que el endpoint `/api/reminders` esté accesible
2. Revisa los logs de la plataforma
3. Prueba llamar manualmente al endpoint
4. Verifica que las variables SMTP estén configuradas

### Los correos no se envían

1. Verifica configuración SMTP en `.env`
2. Revisa que los tickets tengan `asignadoEmail`
3. Verifica que `ansFechaCompromiso` esté definido
4. Revisa logs de errores en la consola

### Múltiples correos duplicados

El sistema no rastrea si ya se envió un recordatorio. Si necesitas evitar duplicados, puedes:
- Agregar un campo `ultimoRecordatorioEnviado` al schema de Prisma
- Modificar `checkAndSendReminders` para verificar este campo

## 📝 Notas Importantes

- El sistema envía recordatorios a tickets que **no están cerrados ni anulados**
- Solo envía a tickets con **responsable asignado** y **email válido**
- El horario del cron es según la **zona horaria del servidor**, no la local
- Los recordatorios se envían **una vez por ejecución del cron**
