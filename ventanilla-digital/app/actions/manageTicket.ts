"use server";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { auth } from "@/auth";
import { sendAssignmentEmail } from "@/lib/email";

const getPrisma = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no está configurado.");
  }
  const globalForPrisma = globalThis as typeof globalThis & { prisma?: PrismaClient };
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    });
  }
  return globalForPrisma.prisma;
};

const parseId = (id: string | number) => {
  const parsed = typeof id === "string" ? Number(id) : id;
  if (!Number.isFinite(parsed)) {
    throw new Error("ID inválido");
  }
  return parsed;
};

const ADMIN_EMAILS = [
  "pasantedesarrollo@investinbogota.org",
  ...(process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
];

const isAdmin = (email?: string | null) => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

export const startTicket = async (id: string | number) => {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("No autorizado");
  }

  const prisma = getPrisma();
  const ticketId = parseId(id);
  return prisma.ticket.update({
    where: { idTicket: ticketId },
    data: {
      estado: "En_Proceso",
      fechaAtencion: new Date(),
    },
  });
};

export const closeTicket = async (id: string | number) => {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("No autorizado");
  }
  if (!isAdmin(session.user.email)) {
    throw new Error("Permisos insuficientes");
  }

  const prisma = getPrisma();
  const ticketId = parseId(id);
  return prisma.ticket.update({
    where: { idTicket: ticketId },
    data: {
      estado: "Cerrado",
      fechaCierre: new Date(),
    },
  });
};

export const assignTicket = async (id: string | number, emailResponsable: string) => {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("No autorizado");
  }
  if (!isAdmin(session.user.email)) {
    throw new Error("Permisos insuficientes");
  }

  const prisma = getPrisma();
  const ticketId = parseId(id);
  const updated = await prisma.ticket.update({
    where: { idTicket: ticketId },
    data: {
      asignadoEmail: emailResponsable,
    },
  });

  try {
    await sendAssignmentEmail(emailResponsable, ticketId, updated.tipoSolicitud);
  } catch (error) {
    console.error("[SMTP] Error al enviar correo de asignación:", error);
  }

  return updated;
};
