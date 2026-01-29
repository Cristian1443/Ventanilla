import { auth } from "@/auth";
import { TicketService } from "@/services/ticket.service";

import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    return (
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-zinc-50 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900">Acceso Requerido</h1>
          <p className="mt-2 text-zinc-600">Por favor, inicia sesión para ver el dashboard.</p>
        </div>
      </main>
    );
  }

  const tickets = await TicketService.findByUser(userEmail);

  // Calcular métricas para el dashboard PERSONAL (o general si así se desea, pero dashboard suele ser personal)
  // El mockup parece ser un dashboard general. Asumiremos que este es el dashboard personal del usuario.
  const total = tickets.length;
  const enProceso = tickets.filter(t => t.estado === "En_Proceso").length;
  const cerrados = tickets.filter(t => t.estado === "Cerrado").length;
  const abiertos = tickets.filter(t => t.estado === "Abierto").length;

  return (
    <main className="bg-white min-h-[calc(100vh-64px)] pb-12">
      <DashboardClient tickets={tickets} />
    </main>
  );
}
