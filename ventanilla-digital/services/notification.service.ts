import { sendAssignmentEmail, sendReminderEmail } from "@/lib/email";

export class NotificationService {
    /**
     * Envía notificación de asignación a un responsable
     */
    static async notifyAssignment(email: string, ticketId: number, tipoSolicitud: string) {
        try {
            await sendAssignmentEmail(email, ticketId, tipoSolicitud);
        } catch (error) {
            console.error("[NotificationService] Error enviando asignación:", error);
            // No re-lanzamos el error para no bloquear el flujo principal
        }
    }

    /**
     * Envía recordatorio de vencimiento
     */
    static async sendExpirationReminder(
        email: string,
        ticketId: number,
        tipoSolicitud: string,
        fechaCompromiso: Date
    ) {
        try {
            await sendReminderEmail(email, ticketId, tipoSolicitud, fechaCompromiso);
        } catch (error) {
            console.error(`[NotificationService] Error enviando recordatorio ticket #${ticketId}:`, error);
            throw error; // Aquí sí lanzamos para que el job sepa que falló
        }
    }
}
