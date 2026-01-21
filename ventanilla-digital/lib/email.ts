import nodemailer from "nodemailer";

const getTransporter = () => {
  const host = process.env.SMTP_HOST?.trim();
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  const missing = [
    !host && "SMTP_HOST",
    !user && "SMTP_USER",
    !pass && "SMTP_PASS",
  ].filter(Boolean) as string[];

  if (missing.length > 0) {
    console.error(`Faltan variables SMTP en el entorno: ${missing.join(", ")}`);
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
};

export const sendAssignmentEmail = async (
  toEmail: string,
  ticketId: number,
  ticketTitle: string
) => {
  const transporter = getTransporter();
  if (!transporter) {
    return;
  }
  const fromName = "Ventanilla de Servicio Digital – Invest in Bogotá";
  const subject = `Ventanilla Digital | Ticket #${ticketId} asignado: ${ticketTitle}`;

  const text = [
    `Se te ha asignado el ticket #${ticketId} (${ticketTitle}).`,
    "",
    "Ingresa a la Ventanilla de Servicio Digital para revisarlo y dar respuesta.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #111827;">
      <h2 style="margin: 0 0 12px 0;">Se te asignó un ticket</h2>
      <p style="margin: 0 0 8px 0;">Hola,</p>
      <p style="margin: 0 0 16px 0;">
        Se te ha asignado el ticket <strong>#${ticketId}</strong> (${ticketTitle}).
      </p>
      <p style="margin: 0 0 16px 0;">
        Ingresa al dashboard para gestionarlo.
      </p>
      <div style="padding: 12px 16px; background: #f3f4f6; border-radius: 8px;">
        <strong>Ticket:</strong> #${ticketId} – ${ticketTitle}
      </div>
      <p style="margin: 16px 0 0 0; font-size: 12px; color: #6b7280;">
        Ventanilla de Servicio Digital
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"${fromName}" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject,
    text,
    html,
  });
};

export const sendReminderEmail = async (
  toEmail: string,
  ticketId: number,
  ticketTitle: string,
  fechaCompromiso: Date
) => {
  const transporter = getTransporter();
  if (!transporter) {
    return;
  }
  const fromName = "Ventanilla de Servicio Digital – Invest in Bogotá";
  
  const fechaFormateada = fechaCompromiso.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  const hoy = new Date();
  const diffTime = fechaCompromiso.getTime() - hoy.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  let mensajeUrgencia = "";
  if (diffDays === 0) {
    mensajeUrgencia = "⏰ <strong>Vence HOY</strong>";
  } else if (diffDays === 1) {
    mensajeUrgencia = "⚠️ <strong>Vence mañana</strong>";
  } else {
    mensajeUrgencia = `📅 Vence en ${diffDays} días`;
  }

  const subject = `Ventanilla Digital | Recordatorio: Ticket #${ticketId} próximo a vencer`;

  const text = [
    `Recordatorio: El ticket #${ticketId} (${ticketTitle}) está próximo a vencer.`,
    "",
    `Fecha de compromiso: ${fechaFormateada}`,
    mensajeUrgencia.replace(/<[^>]*>/g, ""),
    "",
    "Por favor, revisa el ticket y toma las acciones necesarias para cumplir con el SLA.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #111827; max-width: 600px;">
      <div style="background: #E84922; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0; font-size: 20px;">Recordatorio de Ticket</h2>
      </div>
      <div style="padding: 20px; background: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="margin: 0 0 16px 0;">Hola,</p>
        <p style="margin: 0 0 16px 0;">
          Te recordamos que el ticket <strong>#${ticketId}</strong> (${ticketTitle}) está próximo a vencer.
        </p>
        <div style="padding: 16px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin: 16px 0;">
          <p style="margin: 0 0 8px 0; font-weight: 600; color: #92400e;">
            ${mensajeUrgencia}
          </p>
          <p style="margin: 0; color: #78350f;">
            Fecha de compromiso: <strong>${fechaFormateada}</strong>
          </p>
        </div>
        <div style="padding: 12px 16px; background: #f3f4f6; border-radius: 8px; margin: 16px 0;">
          <strong>Ticket:</strong> #${ticketId} – ${ticketTitle}
        </div>
        <p style="margin: 16px 0 0 0;">
          Por favor, ingresa al dashboard para revisar el ticket y tomar las acciones necesarias para cumplir con el SLA.
        </p>
        <p style="margin: 16px 0 0 0; font-size: 12px; color: #6b7280;">
          Ventanilla de Servicio Digital – Invest in Bogotá
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"${fromName}" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject,
    text,
    html,
  });
};
