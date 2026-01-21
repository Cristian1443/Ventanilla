import { auth } from "@/auth";
import CreateTicketForm from "@/components/CreateTicketForm";
import Link from "next/link";
import Image from "next/image";
import SignIn from "@/components/SignIn";

export default async function Home() {
  const session = await auth();
  const user = {
    nombre: session?.user?.name ?? "",
    cargo: (session?.user as { cargo?: string })?.cargo ?? "",
    gerencia: (session?.user as { gerencia?: string })?.gerencia ?? "",
    email: session?.user?.email ?? "",
  };

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 py-12 text-zinc-900 dark:from-black dark:to-zinc-950 dark:text-zinc-50 sm:px-8">
        <div className="mx-auto w-full max-w-2xl">
          <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-white to-[#E84922]/5 p-8 shadow-xl dark:border-zinc-800 dark:from-zinc-950 dark:to-[#E84922]/10 sm:p-10">
            {/* Logo */}
            <div className="mb-8">
              <Image
                src="/logo.svg"
                alt="Invest in Bogotá"
                width={240}
                height={76}
                className="h-14 w-auto object-contain"
                priority
              />
            </div>

            {/* Título y descripción */}
            <div className="mb-8 space-y-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-[#E84922] sm:text-4xl">
                Ventanilla de Servicio Digital
              </h1>
              <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
                Inicia sesión con tu cuenta corporativa para crear y gestionar solicitudes.
              </p>
            </div>

            {/* Sección de login */}
            <div className="mb-8 rounded-xl border border-zinc-200 bg-white/80 p-6 dark:border-zinc-800 dark:bg-zinc-900/60">
              <div className="mb-6 space-y-1">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Iniciar sesión</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Usa tu cuenta corporativa para continuar.
                </p>
              </div>
              <SignIn />
            </div>

            {/* Características */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-zinc-200 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                <p className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Acceso seguro</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">Autenticación con Microsoft Entra ID.</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                <p className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Trazabilidad</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">Seguimiento por estado, SLA y gerencia.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 py-10 text-zinc-900 dark:from-black dark:to-zinc-950 dark:text-zinc-50 sm:px-8">
      <div className="mx-auto w-full max-w-7xl rounded-2xl bg-white p-8 shadow-lg dark:bg-zinc-900">
        <div className="space-y-6">
          <div className="flex items-center gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
            <Image
              src="/logo.svg"
              alt="Invest in Bogotá"
              width={60}
              height={60}
              className="h-12 w-auto object-contain"
              priority
            />
            <div>
              <h1 className="text-2xl font-bold text-[#E84922]">Ventanilla de Servicio Digital</h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Bienvenido,{" "}
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  {user.nombre || user.email || "Usuario"}
                </span>
              </p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#E84922] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#cf3d1f] sm:w-fit"
          >
            Ir al Dashboard
          </Link>
          <CreateTicketForm currentUser={user} />
        </div>
      </div>
    </main>
  );
}
