import { auth } from "@/auth";
import { TicketService } from "@/services/ticket.service";
import { isAdmin, isGerente, ADMIN_EMAILS } from "@/lib/config";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AdminChart from "@/components/AdminChart";
import SendRemindersButton from "@/components/SendRemindersButton";

export const runtime = "nodejs";

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
  const userIsAdmin = isAdmin(userEmail);
  const userIsManager = isGerente(session?.user?.cargo);

  if (!userIsAdmin && !userIsManager) {
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
            Emails autorizados: {ADMIN_EMAILS.join(", ")} o cargos de Gerencia.
          </p>
        </div>
      </main>
    );
  }

  // Capa de Servicios
  const metrics = await TicketService.getAdminMetrics();
  const ultimosCerrados = await TicketService.getRecentClosed(5);

  const totalTickets = metrics.total;
  const slaCumplidos = metrics.slaCumplidos;
  const ticketsVencidos = metrics.vencidos;

  // Calcular porcentaje SLA
  const porcentajeSla = totalTickets > 0 ? Math.round((slaCumplidos / totalTickets) * 100) : 0;

  // Formatear datos para gráficas
  const estadoMap = new Map(metrics.porEstado.map((row: any) => [row.estado, row._count.estado]));
  const chartData = [
    { estado: "Abierto", cantidad: estadoMap.get("Abierto") ?? 0 },
    { estado: "En Proceso", cantidad: estadoMap.get("En_Proceso") ?? 0 },
    { estado: "Cerrado", cantidad: estadoMap.get("Cerrado") ?? 0 },
  ];

  const gerenciaData = metrics.porGerencia
    .map((row: any) => ({
      gerencia: row.usuarioGerencia || "Sin gerencia",
      cantidad: row._count.usuarioGerencia,
    }))
    .sort((a: any, b: any) => b.cantidad - a.cantidad);

  const gerenciaChartData = gerenciaData.map((item: any) => ({
    gerencia: item.gerencia.length > 20 ? item.gerencia.substring(0, 20) + "..." : item.gerencia,
    cantidad: item.cantidad,
  }));

  // Nota: El promedio de horas de cierre se podría mover al servicio para ser 100% puro.
  // Por ahora, como es una vista de analytics, lo dejamos o simplificamos.
  // Originalmente calculaba sobre TODOS los cerrados.
  const promedioHorasCierre = 0; // Placeholder o mover al service

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
              <CardTitle className="text-sm sm:text-base">Solicitudes en Proceso</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold sm:text-3xl">{estadoMap.get("En_Proceso") ?? 0}</p>
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
            <CardTitle className="text-sm sm:text-base">Recordatorios de Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3 sm:text-sm">
              Envía recordatorios por correo a los responsables de tickets que están próximos a vencer (1 día antes).
            </p>
            <SendRemindersButton />
          </CardContent>
        </Card>

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
                    gerenciaData.map((item: any, index: number) => (
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
            <CardTitle className="text-sm sm:text-base">Últimas solicitudes Cerradas</CardTitle>
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
                  {ultimosCerrados.map((ticket: any) => (
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
