"use server";

import { auth } from "@/auth";
import { TicketService } from "@/services/ticket.service";
import { createTicketSchema, CreateTicketInput } from "@/lib/ticket-utils";

export const createTicket = async (input: CreateTicketInput) => {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("No autorizado: Debes iniciar sesión para crear un ticket.");
  }

  // Validar datos
  const data = createTicketSchema.parse(input);

  // Delegar creación al servicio
  const ticket = await TicketService.create(data, {
    email: session.user.email,
    name: session.user.name || undefined,
    cargo: session.user.cargo || undefined,
    gerencia: session.user.gerencia || undefined,
  });

  return ticket;
};
