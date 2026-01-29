

import { TicketService } from "@/services/ticket.service";
import { NotificationService } from "@/services/notification.service";

/**
 * Verifica tickets próximos a vencer y envía recordatorios por correo
 * @param diasAnticipacion - Días antes de la fecha de vencimiento para enviar recordatorio (default: 1)
 */
export async function checkAndSendReminders(diasAnticipacion: number = 1) {
  const ticketsProximos = await TicketService.findExpiring(diasAnticipacion);

  const resultados = {
    total: ticketsProximos.length,
    enviados: 0,
    errores: 0,
    erroresDetalle: [] as string[],
  };

  // Enviar recordatorios
  for (const ticket of ticketsProximos) {
    if (!ticket.asignadoEmail || !ticket.ansFechaCompromiso) {
      continue;
    }

    try {
      await NotificationService.sendExpirationReminder(
        ticket.asignadoEmail,
        ticket.idTicket,
        ticket.tipoSolicitud,
        ticket.ansFechaCompromiso
      );
      resultados.enviados++;
    } catch (error) {
      resultados.errores++;
      resultados.erroresDetalle.push(
        `Ticket #${ticket.idTicket}: ${error instanceof Error ? error.message : "Error desconocido"}`
      );
    }
  }

  return resultados;
}


