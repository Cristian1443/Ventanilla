import { getPrismaClient } from "@/lib/prisma";
import { CreateTicketInput, mapPrioridad, mapTipoEntidad } from "@/lib/ticket-utils";
import { calcularFechaSLAPorDiasHabiles } from "@/lib/sla-calculator";
import { NotificationService } from "@/services/notification.service";
import { isAdmin } from "@/lib/config";

export class TicketService {
    /**
     * Crea un nuevo ticket y notifica si hay asignación inicial
     */
    static async create(data: CreateTicketInput, currentUser: { email: string; name?: string; cargo?: string; gerencia?: string }) {
        const prisma = getPrismaClient();
        if (!prisma) throw new Error("DATABASE_URL no está configurado.");

        const prioridad = mapPrioridad(data.prioridad);
        const ansFechaCompromiso = calcularFechaSLAPorDiasHabiles(new Date(), data.diasResolucion);

        const ticket = await prisma.ticket.create({
            data: {
                tipoSolicitud: data.tipoTicket,
                descripcion: data.descripcion,
                prioridad,
                diasResolucion: data.diasResolucion,
                tipoEntidad: mapTipoEntidad(data.tipoEntidad),
                usuarioNombre: currentUser.name || data.solicitanteNombre || "Usuario Desconocido",
                usuarioEmail: currentUser.email,
                usuarioCargo: currentUser.cargo || data.solicitanteCargo || "Sin Cargo",
                usuarioGerencia: currentUser.gerencia || data.solicitanteGerencia || "Sin Gerencia",
                asignadoNombre: data.asignadoNombre || null,
                asignadoCargo: data.asignadoCargo || null,
                asignadoEmail: data.asignadoEmail || null,
                asignadoGerencia: data.asignadoGerencia || null,
                empresaNIT: data.nit || data.taxId || null,
                empresaNombre: data.empresaNombre || data.nombrePersona || null,
                empresaTelefono: data.tipoEntidad === "PERSONA_NATURAL" ? data.personaTelefono || null : data.telefono || null,
                empresaCorreo: data.tipoEntidad === "PERSONA_NATURAL" ? data.personaCorreo || null : null,
                empresaPais: data.pais || (data.tipoEntidad === "EMPRESA_LOCAL" ? "Colombia" : null),
                empresaCiudad: data.ciudad || null,
                ansFechaCompromiso,
            },
        });

        if (ticket.asignadoEmail) {
            await NotificationService.notifyAssignment(ticket.asignadoEmail, ticket.idTicket, ticket.tipoSolicitud);
        }

        return ticket;
    }

    /**
     * Actualiza el estado de un ticket (Iniciar/Cerrar) verificando permisos
     */
    static async updateStatus(ticketId: number, nuevoEstado: "En_Proceso" | "Cerrado", userEmail: string) {
        const prisma = getPrismaClient();
        if (!prisma) throw new Error("DATABASE_URL no está configurado.");

        const ticket = await prisma.ticket.findUnique({
            where: { idTicket: ticketId },
            select: { asignadoEmail: true },
        });

        if (!ticket) throw new Error("Ticket no encontrado");

        const esAdmin = isAdmin(userEmail);
        const esAsignado = ticket.asignadoEmail === userEmail;

        if (!esAdmin && !esAsignado) {
            throw new Error("Permisos insuficientes");
        }

        const dataUpdate: any = { estado: nuevoEstado };
        if (nuevoEstado === "En_Proceso") dataUpdate.fechaAtencion = new Date();
        if (nuevoEstado === "Cerrado") {
            const now = new Date();
            dataUpdate.fechaCierre = now;

            // Calcular si cumplió SLA
            const existingTicket = await prisma.ticket.findUnique({
                where: { idTicket: ticketId },
                select: { ansFechaCompromiso: true }
            });

            if (existingTicket?.ansFechaCompromiso) {
                const cumplio = now <= existingTicket.ansFechaCompromiso;
                dataUpdate.ansCumplido = cumplio;
                dataUpdate.ansEstado = cumplio ? "Cumplido" : "Vencido";
            }
        }

        return prisma.ticket.update({
            where: { idTicket: ticketId },
            data: dataUpdate,
        });
    }

    /**
     * Asigna un ticket a un responsable
     */
    static async assign(ticketId: number, emailResponsable: string, userEmail: string) {
        const prisma = getPrismaClient();
        if (!prisma) throw new Error("DATABASE_URL no está configurado.");

        // Solo admin o gerente pueden asignar (aquí asumimos admin por ahora, se puede extender)
        if (!isAdmin(userEmail)) {
            throw new Error("Permisos insuficientes");
        }

        const ticket = await prisma.ticket.findUnique({
            where: { idTicket: ticketId },
            select: { estado: true, idTicket: true, tipoSolicitud: true },
        });

        if (!ticket) throw new Error("Ticket no encontrado");

        if (ticket.estado !== "En_Proceso") {
            if (ticket.estado === "Cerrado") throw new Error("No se puede asignar un responsable a un ticket cerrado");
            throw new Error("Solo se puede asignar un responsable cuando el ticket está en proceso");
        }

        const updated = await prisma.ticket.update({
            where: { idTicket: ticketId },
            data: { asignadoEmail: emailResponsable },
        });

        await NotificationService.notifyAssignment(emailResponsable, ticket.idTicket, ticket.tipoSolicitud);

        return updated;
    }

    /**
     * Busca tickets próximos a vencer para recordatorios
     */
    static async findExpiring(diasAnticipacion: number = 1) {
        const prisma = getPrismaClient();
        if (!prisma) throw new Error("DATABASE_URL no está configurado.");

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const fechaLimite = new Date(hoy);
        fechaLimite.setDate(fechaLimite.getDate() + diasAnticipacion);
        fechaLimite.setHours(23, 59, 59, 999);

        return prisma.ticket.findMany({
            where: {
                ansFechaCompromiso: { gte: hoy, lte: fechaLimite },
                estado: { notIn: ["Cerrado", "Anulado"] },
                asignadoEmail: { not: null },
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
    }
    /**
     * Obtiene tickets relacionados con un usuario (creados o asignados)
     */
    static async findByUser(email: string) {
        const prisma = getPrismaClient();
        if (!prisma) throw new Error("DATABASE_URL no está configurado.");

        return prisma.ticket.findMany({
            where: {
                OR: [
                    { asignadoEmail: email },
                    { usuarioEmail: email }
                ]
            },
            orderBy: { fechaSolicitud: "desc" },
        });
    }

    /**
     * Obtiene métricas generales para administración
     */
    static async getAdminMetrics() {
        const prisma = getPrismaClient();
        if (!prisma) throw new Error("DATABASE_URL no está configurado.");

        const now = new Date();
        const [
            total,
            slaCumplidos,
            vencidos,
            porEstado,
            porGerencia
        ] = await Promise.all([
            prisma.ticket.count(),
            prisma.ticket.count({ where: { ansCumplido: true } }),
            prisma.ticket.count({
                where: {
                    OR: [
                        { ansEstado: "Vencido" }, // Para los cerrados vencidos
                        {
                            estado: { not: "Cerrado" },
                            ansFechaCompromiso: { lt: now }
                        } // Para los abiertos ya vencidos
                    ]
                }
            }),
            prisma.ticket.groupBy({
                by: ["estado"],
                _count: { estado: true },
            }),
            prisma.ticket.groupBy({
                by: ["usuarioGerencia"],
                _count: { usuarioGerencia: true },
            })
        ]);

        return {
            total,
            slaCumplidos,
            vencidos,
            porEstado,
            porGerencia
        };
    }

    /**
     * Obtiene los últimos tickets cerrados
     */
    static async getRecentClosed(limit: number = 5) {
        const prisma = getPrismaClient();
        if (!prisma) throw new Error("DATABASE_URL no está configurado.");

        return prisma.ticket.findMany({
            where: { estado: "Cerrado" },
            orderBy: { fechaCierre: "desc" },
            take: limit
        });
    }
}
