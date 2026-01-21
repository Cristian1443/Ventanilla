"use server";

import { getPrismaClient } from "@/lib/prisma";
import { sendReminderEmail } from "@/lib/email";

/**
 * Verifica tickets próximos a vencer y envía recordatorios por correo
 * @param diasAnticipacion - Días antes de la fecha de vencimiento para enviar recordatorio (default: 1)
 */
export async function checkAndSendReminders(diasAnticipacion: number = 1) {
  const prisma = getPrismaClient();
  if (!prisma) {
    throw new Error("DATABASE_URL no está configurado.");
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Calcular la fecha límite (díasAnticipacion días antes de la fecha de compromiso)
  const fechaLimite = new Date(hoy);
  fechaLimite.setDate(fechaLimite.getDate() + diasAnticipacion);
  fechaLimite.setHours(23, 59, 59, 999);

  // Buscar tickets que:
  // 1. Tengan fecha de compromiso definida
  // 2. Estén entre hoy y la fecha límite
  // 3. No estén cerrados ni anulados
  // 4. Tengan un responsable asignado con email
  const ticketsProximos = await prisma.ticket.findMany({
    where: {
      ansFechaCompromiso: {
        gte: hoy,
        lte: fechaLimite,
      },
      estado: {
        notIn: ["Cerrado", "Anulado"],
      },
      asignadoEmail: {
        not: null,
      },
    },
    select: {
      idTicket: true,
      tipoSolicitud: true,
      ansFechaCompromiso: true,
      asignadoEmail: true,
      asignadoNombre: true,
      estado: true,
    },
  });

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
      await sendReminderEmail(
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
      console.error(`[checkReminders] Error al enviar recordatorio para ticket #${ticket.idTicket}:`, error);
    }
  }

  return resultados;
}
