import { z } from "zod";

/**
 * Utilidades para mapeo y transformación de datos de tickets
 */

export const tipoEntidadSchema = z.enum(["PERSONA_NATURAL", "EMPRESA_LOCAL", "EMPRESA_EXTRANJERA"]);
export const prioridadSchema = z.enum(["ALTA", "MEDIA", "BAJA"]);

export const mapTipoEntidad = (tipo: z.infer<typeof tipoEntidadSchema>): "Persona_Natural" | "Empresa_Local" | "Empresa_Extranjera" => {
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

export const mapPrioridad = (prioridad: z.infer<typeof prioridadSchema>): "Alta" | "Media" | "Baja" => {
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

export const createTicketSchema = z
  .object({
    solicitanteNombre: z.string().optional(),
    solicitanteCargo: z.string().optional(),
    solicitanteGerencia: z.string().optional(),
    solicitanteEmail: z.string().optional(),
    tipoEntidad: tipoEntidadSchema,
    nombrePersona: z.string().optional(),
    personaCorreo: z.string().email("Email inválido").optional(),
    personaTelefono: z.string().optional(),
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
    asignadoGerencia: z.string().optional(),
  })
  .refine((data) => {
    if (data.tipoEntidad === "PERSONA_NATURAL") {
      return Boolean(data.nombrePersona && data.personaCorreo && data.personaTelefono);
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

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
