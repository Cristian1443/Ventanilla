"use server";

import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { sendAssignmentEmail } from "@/lib/email";

const prisma =
  (globalThis as typeof globalThis & { prisma?: PrismaClient }).prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

if (process.env.NODE_ENV !== "production") {
  (globalThis as typeof globalThis & { prisma?: PrismaClient }).prisma = prisma;
}

const prioridadSchema = z.enum(["ALTA", "MEDIA", "BAJA"]);
const tipoEntidadSchema = z.enum(["PERSONA_NATURAL", "EMPRESA_LOCAL", "EMPRESA_EXTRANJERA"]);

const createTicketSchema = z
  .object({
    solicitanteNombre: z.string().min(1, "El nombre es requerido"),
    solicitanteCargo: z.string().min(1, "El cargo es requerido"),
    solicitanteEmail: z.string().email("Email inválido"),
    tipoEntidad: tipoEntidadSchema,
    documentoId: z.string().optional(),
    nombrePersona: z.string().optional(),
    nit: z.string().optional(),
    taxId: z.string().optional(),
    empresaNombre: z.string().optional(),
    pais: z.string().optional(),
    ciudad: z.string().optional(),
    direccion: z.string().optional(),
    telefono: z.string().optional(),
    tipoTicket: z.enum(["CONSULTA", "SOPORTE_TECNICO", "RECLAMO", "SOLICITUD_CAMBIO", "INCIDENTE"]),
    prioridad: prioridadSchema,
    diasResolucion: z.coerce.number().int().min(1, "Los días deben ser al menos 1"),
    descripcion: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
    asignadoNombre: z.string().optional(),
    asignadoCargo: z.string().optional(),
    asignadoEmail: z.string().email("Email inválido").optional(),
  })
  .refine((data) => {
    if (data.tipoEntidad === "PERSONA_NATURAL") {
      return Boolean(data.nombrePersona);
    }
    if (data.tipoEntidad === "EMPRESA_LOCAL") {
      return Boolean(data.nit && data.empresaNombre && data.ciudad);
    }
    if (data.tipoEntidad === "EMPRESA_EXTRANJERA") {
      return Boolean(data.taxId && data.empresaNombre && data.pais && data.ciudad);
    }
    return true;
  }, { message: "Completa todos los campos requeridos según el tipo de entidad", path: ["tipoEntidad"] })
  .refine((data) => {
    if (data.prioridad === "ALTA") return data.diasResolucion <= 5;
    if (data.prioridad === "MEDIA") return data.diasResolucion <= 10;
    return data.diasResolucion <= 15;
  }, { message: "Los días no corresponden a la prioridad seleccionada", path: ["diasResolucion"] });

type CreateTicketInput = z.infer<typeof createTicketSchema>;

const diasPorPrioridad: Record<z.infer<typeof prioridadSchema>, number> = {
  ALTA: 1,
  MEDIA: 3,
  BAJA: 5,
};

const esFinDeSemana = (fecha: Date) => {
  const dia = fecha.getDay();
  return dia === 0 || dia === 6;
};

const sumarDiasHabiles = (fechaBase: Date, dias: number) => {
  const resultado = new Date(fechaBase);
  let agregados = 0;

  while (agregados < dias) {
    resultado.setDate(resultado.getDate() + 1);
    if (!esFinDeSemana(resultado)) {
      agregados += 1;
    }
  }

  return resultado;
};

const mapTipoEntidad = (tipo: z.infer<typeof tipoEntidadSchema>) => {
  switch (tipo) {
    case "PERSONA_NATURAL":
      return "Persona_Natural";
    case "EMPRESA_LOCAL":
      return "Empresa_Local";
    case "EMPRESA_EXTRANJERA":
      return "Empresa_Extranjera";
    default:
      return "Persona_Natural";
  }
};

const mapPrioridad = (prioridad: z.infer<typeof prioridadSchema>) => {
  switch (prioridad) {
    case "ALTA":
      return "Alta";
    case "MEDIA":
      return "Media";
    case "BAJA":
      return "Baja";
    default:
      return "Media";
  }
};

export const createTicket = async (input: CreateTicketInput) => {
  const data = createTicketSchema.parse(input);
  const prioridad = mapPrioridad(data.prioridad);
  const ansFechaCompromiso = sumarDiasHabiles(new Date(), diasPorPrioridad[data.prioridad]);

  const ticket = await prisma.ticket.create({
    data: {
      tipoSolicitud: data.tipoTicket,
      descripcion: data.descripcion,
      prioridad,
      diasResolucion: data.diasResolucion,
      tipoEntidad: mapTipoEntidad(data.tipoEntidad),
      usuarioNombre: data.solicitanteNombre,
      usuarioEmail: data.solicitanteEmail,
      usuarioCargo: data.solicitanteCargo,
      asignadoNombre: data.asignadoNombre || null,
      asignadoCargo: data.asignadoCargo || null,
      asignadoEmail: data.asignadoEmail || null,
      empresaNIT: data.nit || data.taxId || null,
      empresaNombre: data.empresaNombre || data.nombrePersona || null,
      empresaPais: data.pais || (data.tipoEntidad === "EMPRESA_LOCAL" ? "Colombia" : null),
      empresaCiudad: data.ciudad || null,
      ansFechaCompromiso,
    },
  });

  // Enviar correo si hay responsable asignado
  if (ticket.asignadoEmail) {
    try {
      await sendAssignmentEmail(
        ticket.asignadoEmail,
        ticket.idTicket,
        ticket.tipoSolicitud
      );
    } catch (error) {
      console.error("[createTicket] Error al enviar correo:", error);
      // No fallar la creación del ticket si el correo falla
    }
  }

  return ticket;
};
