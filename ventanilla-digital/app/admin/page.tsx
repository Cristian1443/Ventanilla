import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { auth } from "@/auth";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AdminChart from "@/components/AdminChart";

export const runtime = "nodejs";

const ADMIN_EMAILS = ["pasantedesarrollo@investinbogota.org"];

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

const formatDuracion = (inicio: Date | null, fin: Date | null) => {
  if (!inicio || !fin) return "—";
  const diffMs = fin.getTime() - inicio.getTime();
  const totalHoras = Math.max(0, Math.round(diffMs / (1000 * 60 * 60)));
  const dias = Math.floor(totalHoras / 24);
  const horas = totalHoras % 24;
  if (dias > 0) {
    return `${dias} días, ${horas} horas`;
  }
  return `${horas} horas`;
};

export default async function AdminPage() {
  const session = await auth();
  const userEmail = session?.user?.email ?? "";
  const isAdmin = ADMIN_EMAILS.includes(userEmail);

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900 dark:bg-black dark:text-zinc-50 sm:px-8">
        <div className="mx-auto w-full max-w-3xl rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-900">
          <h1 className="text-2xl font-semibold">Acceso restringido</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Solo Alta Gerencia puede acceder a esta vista.
          </p>
          <p className="mt-4 text-xs text-zinc-500">
            Email actual: {userEmail || "(no detectado)"}
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            Emails autorizados: {ADMIN_EMAILS.join(", ")}
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
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="mt-2 text-sm text-red-600">
            Falta configurar DATABASE_URL en el entorno del servidor.
          </p>
        </div>
      </main>
    );
  }

  const totalTickets = await prisma.ticket.count();
  const slaCumplidos = await prisma.ticket.count({ where: { ansCumplido: true } });
  const ticketsVencidos = await prisma.ticket.count({ where: { ansEstado: "Vencido" } });
  const ticketsCerrados = await prisma.ticket.findMany({
    where: { fechaCierre: { not: null } },
    select: { fechaSolicitud: true, fechaCierre: true },
  });

  const totalHorasCierre = ticketsCerrados.reduce((acc, ticket) => {
    if (!ticket.fechaCierre) return acc;
    const diff = ticket.fechaCierre.getTime() - ticket.fechaSolicitud.getTime();
    return acc + diff / (1000 * 60 * 60);
  }, 0);
  const promedioHorasCierre = ticketsCerrados.length > 0 ? totalHorasCierre / ticketsCerrados.length : 0;

  const estadoCounts = await prisma.ticket.groupBy({
    by: ["estado"],
    _count: { _all: true },
  });

  const estadoMap = new Map(estadoCounts.map((row) => [row.estado, row._count._all]));
  const chartData = [
    { estado: "Abierto", cantidad: estadoMap.get("Abierto") ?? 0 },
    { estado: "En Proceso", cantidad: estadoMap.get("En_Proceso") ?? 0 },
    { estado: "Cerrado", cantidad: estadoMap.get("Cerrado") ?? 0 },
  ];

  const ultimosCerrados = await prisma.ticket.findMany({
    where: { fechaCierre: { not: null } },
    orderBy: { fechaCierre: "desc" },
    take: 5,
    select: {
      idTicket: true,
      tipoSolicitud: true,
      usuarioNombre: true,
      fechaSolicitud: true,
      fechaCierre: true,
    },
  });

  const porcentajeSla = totalTickets > 0 ? Math.round((slaCumplidos / totalTickets) * 100) : 0;

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900 dark:bg-black dark:text-zinc-50 sm:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-8 rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-900">
        <div>
          <h1 className="text-2xl font-semibold">Analytics Alta Gerencia</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Resumen ejecutivo de tickets y tiempos.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{totalTickets}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Cumplimiento SLA</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{porcentajeSla}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Tickets Vencidos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{ticketsVencidos}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Tiempo Prom. Cierre</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{promedioHorasCierre.toFixed(1)} h</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tickets por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminChart data={chartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimos Tickets Cerrados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Asunto</TableHead>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Fecha Solicitud</TableHead>
                  <TableHead>Fecha Cierre</TableHead>
                  <TableHead>Duración Real</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ultimosCerrados.map((ticket) => (
                  <TableRow key={ticket.idTicket}>
                    <TableCell>#{ticket.idTicket}</TableCell>
                    <TableCell>{ticket.tipoSolicitud}</TableCell>
                    <TableCell>{ticket.usuarioNombre}</TableCell>
                    <TableCell>{formatFecha(ticket.fechaSolicitud)}</TableCell>
                    <TableCell>{formatFecha(ticket.fechaCierre)}</TableCell>
                    <TableCell>{formatDuracion(ticket.fechaSolicitud, ticket.fechaCierre)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
