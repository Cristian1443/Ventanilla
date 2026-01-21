import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { getPrismaClient } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TicketActions from "@/components/TicketActions";

export const runtime = "nodejs";

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

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const prisma = getPrismaClient();
  if (!prisma) {
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900 dark:bg-black dark:text-zinc-50 sm:px-8">
        <div className="mx-auto w-full max-w-3xl rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-900">
          <h1 className="text-2xl font-semibold">Detalle de solicitud</h1>
          <p className="mt-2 text-sm text-red-600">
            Falta configurar DATABASE_URL en el entorno del servidor.
          </p>
        </div>
      </main>
    );
  }

  const { id } = await params;
  const ticketId = Number(id);
  if (!Number.isFinite(ticketId)) {
    notFound();
  }

  const ticket = await prisma.ticket.findUnique({
    where: { idTicket: ticketId },
  });

  if (!ticket) {
    notFound();
  }

  const session = await auth();
  const esPersonaNatural = ticket.tipoEntidad === "Persona_Natural";

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 py-10 text-zinc-900 dark:from-black dark:to-zinc-950 dark:text-zinc-50 sm:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6 rounded-2xl bg-white p-8 shadow-lg dark:bg-zinc-900">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div>
            <h1 className="text-2xl font-bold text-[#E84922]">Solicitud #{ticket.idTicket}</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {ticket.tipoSolicitud} • {formatFecha(ticket.fechaSolicitud)}
            </p>
          </div>
          {badgeEstado(ticket.estado)}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#E84922]">Información del Solicitante</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Nombre:</strong> {ticket.usuarioNombre}</p>
              <p><strong>Cargo:</strong> {ticket.usuarioCargo ?? "—"}</p>
              <p><strong>Gerencia:</strong> {ticket.usuarioGerencia ?? "—"}</p>
              <p><strong>Correo:</strong> {ticket.usuarioEmail}</p>
            </CardContent>
          </Card>

          {esPersonaNatural ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-[#E84922]">Información del Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><strong>Nombre:</strong> {ticket.empresaNombre ?? "—"}</p>
                <p><strong>Correo:</strong> {ticket.empresaCorreo ?? "—"}</p>
                <p><strong>Teléfono:</strong> {ticket.empresaTelefono ?? "—"}</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-[#E84922]">Información de la Empresa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><strong>Entidad:</strong> {ticket.tipoEntidad}</p>
                <p><strong>Empresa:</strong> {ticket.empresaNombre ?? "—"}</p>
                <p><strong>NIT/Tax ID:</strong> {ticket.empresaNIT ?? "—"}</p>
                <p><strong>País:</strong> {ticket.empresaPais ?? "—"}</p>
                <p><strong>Ciudad:</strong> {ticket.empresaCiudad ?? "—"}</p>
                <p><strong>Correo contacto:</strong> {ticket.empresaCorreo ?? "—"}</p>
                <p><strong>Teléfono contacto:</strong> {ticket.empresaTelefono ?? "—"}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-[#E84922]">Detalle de la Solicitud</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Tipo:</strong> {ticket.tipoSolicitud}</p>
              <p><strong>Prioridad:</strong> {ticket.prioridad}</p>
              <p><strong>Descripción:</strong> {ticket.descripcion}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-[#E84922]">Fechas y SLA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Fecha Solicitud:</strong> {formatFecha(ticket.fechaSolicitud)}</p>
              <p><strong>Fecha Atención:</strong> {formatFecha(ticket.fechaAtencion)}</p>
              <p><strong>Fecha Cierre:</strong> {formatFecha(ticket.fechaCierre)}</p>
              <p><strong>SLA Compromiso:</strong> {formatFecha(ticket.ansFechaCompromiso)}</p>
            </CardContent>
          </Card>
        </div>

        {session && (
          <Card>
            <CardHeader>
              <CardTitle className="text-[#E84922]">Panel de Gestión</CardTitle>
            </CardHeader>
            <CardContent>
              <TicketActions id={ticket.idTicket} estado={ticket.estado} />
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
