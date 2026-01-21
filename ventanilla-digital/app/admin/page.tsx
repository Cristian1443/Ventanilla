import { auth } from "@/auth";
import { getPrismaClient } from "@/lib/prisma";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AdminChart from "@/components/AdminChart";

export const runtime = "nodejs";

const ADMIN_EMAILS = ["pasantedesarrollo@investinbogota.org"];

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

  const prisma = getPrismaClient();
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

  // Agrupar tickets por gerencia
  const gerenciaCounts = await prisma.ticket.groupBy({
    by: ["usuarioGerencia"],
    _count: { _all: true },
    where: {
      usuarioGerencia: { not: null },
    },
  });

  // Ordenar por cantidad descendente y formatear para tabla y gráfica
  const gerenciaData = gerenciaCounts
    .map((row) => ({
      gerencia: row.usuarioGerencia || "Sin gerencia",
      cantidad: row._count._all,
    }))
    .sort((a, b) => b.cantidad - a.cantidad);

  const gerenciaChartData = gerenciaData.map((item) => ({
    gerencia: item.gerencia.length > 20 ? item.gerencia.substring(0, 20) + "..." : item.gerencia,
    cantidad: item.cantidad,
  }));

  return (
    <main className="min-h-screen bg-zinc-50 px-2 py-4 text-zinc-900 dark:bg-black dark:text-zinc-50 sm:px-4 sm:py-6 md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-7xl space-y-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900 sm:space-y-6 sm:p-6 md:space-y-8 md:p-8">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl">Analytics Alta Gerencia</h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 sm:text-sm">
            Resumen ejecutivo de solicitudes y tiempos.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-sm sm:text-base">Total solicitudes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold sm:text-3xl">{totalTickets}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-sm sm:text-base">Cumplimiento SLA</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold sm:text-3xl">{porcentajeSla}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-sm sm:text-base">Solicitudes Vencidos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold sm:text-3xl">{ticketsVencidos}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-sm sm:text-base">Tiempo Prom. Cierre</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold sm:text-3xl">{promedioHorasCierre.toFixed(1)} h</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-sm sm:text-base">Solicitudes por Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminChart data={chartData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-sm sm:text-base">Solicitudes por Gerencia</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminChart data={gerenciaChartData} labelKey="gerencia" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-sm sm:text-base">Ranking de Gerencias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Posición</TableHead>
                    <TableHead className="text-xs sm:text-sm">Gerencia</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">Total Solicitudes</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">% del Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gerenciaData.length > 0 ? (
                    gerenciaData.map((item, index) => (
                      <TableRow key={item.gerencia}>
                        <TableCell className="text-xs sm:text-sm">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold dark:bg-zinc-800 sm:h-6 sm:w-6">
                            {index + 1}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs font-medium sm:text-sm">{item.gerencia}</TableCell>
                        <TableCell className="text-right text-xs font-semibold sm:text-sm">{item.cantidad}</TableCell>
                        <TableCell className="text-right text-xs text-zinc-600 dark:text-zinc-400 sm:text-sm">
                          {totalTickets > 0 ? Math.round((item.cantidad / totalTickets) * 100) : 0}%
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-xs text-zinc-500 sm:text-sm">
                        No hay datos de gerencias disponibles
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-sm sm:text-base">Últimas solicitudes Cerrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">ID</TableHead>
                    <TableHead className="text-xs sm:text-sm">Asunto</TableHead>
                    <TableHead className="hidden text-xs sm:table-cell sm:text-sm">Solicitante</TableHead>
                    <TableHead className="text-xs sm:text-sm">Fecha Solicitud</TableHead>
                    <TableHead className="hidden text-xs sm:table-cell sm:text-sm">Fecha Cierre</TableHead>
                    <TableHead className="text-xs sm:text-sm">Duración</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ultimosCerrados.map((ticket) => (
                    <TableRow key={ticket.idTicket}>
                      <TableCell className="text-xs sm:text-sm">#{ticket.idTicket}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{ticket.tipoSolicitud}</TableCell>
                      <TableCell className="hidden text-xs sm:table-cell sm:text-sm">{ticket.usuarioNombre}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{formatFecha(ticket.fechaSolicitud)}</TableCell>
                      <TableCell className="hidden text-xs sm:table-cell sm:text-sm">{formatFecha(ticket.fechaCierre)}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{formatDuracion(ticket.fechaSolicitud, ticket.fechaCierre)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
