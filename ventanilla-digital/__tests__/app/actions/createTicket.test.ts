import { createTicket } from "@/app/actions/createTicket";
import { getPrismaClient } from "@/lib/prisma";
import { sendAssignmentEmail } from "@/lib/email";

// Mock dependencies
jest.mock("@/lib/prisma");
jest.mock("@/lib/email");

const mockPrisma = {
  ticket: {
    create: jest.fn(),
  },
};

const mockGetPrismaClient = getPrismaClient as jest.MockedFunction<typeof getPrismaClient>;
const mockSendAssignmentEmail = sendAssignmentEmail as jest.MockedFunction<typeof sendAssignmentEmail>;

describe("createTicket", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPrismaClient.mockReturnValue(mockPrisma as any);
  });

  it("debe crear un ticket correctamente", async () => {
    const ticketData = {
      solicitanteNombre: "Juan Pérez",
      solicitanteCargo: "Desarrollador",
      solicitanteGerencia: "TI",
      solicitanteEmail: "juan@example.com",
      tipoEntidad: "PERSONA_NATURAL" as const,
      nombrePersona: "Juan Pérez",
      personaCorreo: "juan@example.com",
      personaTelefono: "1234567890",
      tipoTicket: "CONSULTA" as const,
      prioridad: "ALTA" as const,
      diasResolucion: 3,
      descripcion: "Esta es una descripción de prueba para el ticket",
    };

    const mockTicket = {
      idTicket: 1,
      ...ticketData,
      ansFechaCompromiso: new Date(),
    };

    mockPrisma.ticket.create.mockResolvedValue(mockTicket as any);

    const result = await createTicket(ticketData);

    expect(mockPrisma.ticket.create).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockTicket);
  });

  it("debe validar campos requeridos", async () => {
    const invalidData = {
      solicitanteNombre: "",
      solicitanteCargo: "Desarrollador",
      solicitanteGerencia: "TI",
      solicitanteEmail: "juan@example.com",
      tipoEntidad: "PERSONA_NATURAL" as const,
      tipoTicket: "CONSULTA" as const,
      prioridad: "ALTA" as const,
      diasResolucion: 3,
      descripcion: "Descripción corta",
    };

    await expect(createTicket(invalidData as any)).rejects.toThrow();
  });

  it("debe enviar correo si hay responsable asignado", async () => {
    const ticketData = {
      solicitanteNombre: "Juan Pérez",
      solicitanteCargo: "Desarrollador",
      solicitanteGerencia: "TI",
      solicitanteEmail: "juan@example.com",
      tipoEntidad: "PERSONA_NATURAL" as const,
      nombrePersona: "Juan Pérez",
      personaCorreo: "juan@example.com",
      personaTelefono: "1234567890",
      tipoTicket: "CONSULTA" as const,
      prioridad: "ALTA" as const,
      diasResolucion: 3,
      descripcion: "Esta es una descripción de prueba para el ticket",
      asignadoEmail: "responsable@example.com",
      asignadoNombre: "Responsable",
    };

    const mockTicket = {
      idTicket: 1,
      asignadoEmail: "responsable@example.com",
      tipoSolicitud: "CONSULTA",
    };

    mockPrisma.ticket.create.mockResolvedValue(mockTicket as any);

    await createTicket(ticketData);

    expect(mockSendAssignmentEmail).toHaveBeenCalledWith(
      "responsable@example.com",
      1,
      "CONSULTA"
    );
  });
});
