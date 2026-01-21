import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { auth } from "@/auth";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";

export const runtime = "nodejs";

const getPrisma = () => {
  if (!process.env.DATABASE_URL) return null;
  const globalForPrisma = globalThis as typeof globalThis & { prisma?: PrismaClient };
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    });
  }
  return globalForPrisma.prisma;
};

const formatFecha = (fecha: Date | null) => {
  if (!fecha) return "—";
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(fecha);
};

const badgeEstado = (estado: string) => {
  if (estado === "Abierto") return <Badge variant="info">Abierto</Badge>;
  if (estado === "En_Proceso") return <Badge variant="warning">En Proceso</Badge>;
  if (estado === "Cerrado") return <Badge variant="success">Cerrado</Badge>;
  return <Badge>{estado.replace("_", " ")}</Badge>;
};

const prioridadView = (prioridad: string) => {
  if (prioridad === "Alta") {
    return (
      <span className="inline-flex items-center gap-2 font-medium text-red-600">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        Alta
      </span>
    );
  }
  return <span className="text-zinc-700 dark:text-zinc-200">{prioridad}</span>;
};

export default async function DashboardPage() {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900 dark:bg-black dark:text-zinc-50 sm:px-8">
        <div className="mx-auto w-full max-w-3xl rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-900">
          <h1 className="text-2xl font-semibold">Dashboard de Gestión</h1>
          <p className="mt-2 text-sm text-red-600">
            Debes iniciar sesión para ver tus tickets asignados.
          </p>
        </div>
      </main>
    );
  }

  const prisma = getPrisma();
  if (!prisma) {
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900 dark:bg-black dark:text-zinc-50 sm:px-8">
        <div className="mx-auto w-full max-w-3xl rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-900">
          <h1 className="text-2xl font-semibold">Dashboard de Gestión</h1>
          <p className="mt-2 text-sm text-red-600">
            Falta configurar DATABASE_URL en el entorno del servidor.
          </p>
        </div>
      </main>
    );
  }

  const tickets = await prisma.ticket.findMany({
    where: {
      asignadoEmail: userEmail,
    },
    orderBy: { fechaSolicitud: "desc" },
  });

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900 dark:bg-black dark:text-zinc-50 sm:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6 rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-900">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Dashboard de Gestión</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Tickets asignados a tu correo ({userEmail}).
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Asunto</TableHead>
              <TableHead>Solicitante</TableHead>
              <TableHead>Fecha Solicitud</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>SLA</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.idTicket}>
                <TableCell>
                  <Link className="text-blue-600 hover:underline" href={`/dashboard/${ticket.idTicket}`}>
                    #{ticket.idTicket}
                  </Link>
                </TableCell>
                <TableCell className="font-medium">
                  <Link className="text-blue-600 hover:underline" href={`/dashboard/${ticket.idTicket}`}>
                    {ticket.tipoSolicitud}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{ticket.usuarioNombre}</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {ticket.empresaNombre ?? "Persona Natural"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{formatFecha(ticket.fechaSolicitud)}</TableCell>
                <TableCell>{prioridadView(ticket.prioridad)}</TableCell>
                <TableCell>{badgeEstado(ticket.estado)}</TableCell>
                <TableCell>{formatFecha(ticket.ansFechaCompromiso)}</TableCell>
                <TableCell>
                  <Link
                    className="inline-flex items-center justify-center rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
                    href={`/dashboard/${ticket.idTicket}`}
                  >
                    Ver detalle
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
