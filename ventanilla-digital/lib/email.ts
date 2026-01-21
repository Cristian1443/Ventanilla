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
  const fromName = "Ventanilla Digital";
  const subject = `Asignación de Ticket #${ticketId}`;

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
    html,
  });
};
