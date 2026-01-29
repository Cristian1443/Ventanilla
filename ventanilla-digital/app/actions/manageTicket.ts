"use server";

import { auth } from "@/auth";
import { TicketService } from "@/services/ticket.service";

const parseId = (id: string | number) => {
  const parsed = typeof id === "string" ? Number(id) : id;
  if (!Number.isFinite(parsed)) {
    throw new Error("ID inválido");
  }
  return parsed;
};

export const startTicket = async (id: string | number) => {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("No autorizado");
  }

  return TicketService.updateStatus(parseId(id), "En_Proceso", session.user.email);
};

export const closeTicket = async (id: string | number) => {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("No autorizado");
  }

  return TicketService.updateStatus(parseId(id), "Cerrado", session.user.email);
};

export const assignTicket = async (id: string | number, emailResponsable: string) => {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("No autorizado");
  }

  return TicketService.assign(parseId(id), emailResponsable, session.user.email);
};
