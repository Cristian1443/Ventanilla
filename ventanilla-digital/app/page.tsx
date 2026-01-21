import { auth } from "@/auth";
import CreateTicketForm from "@/components/CreateTicketForm";
import Link from "next/link";
import SignIn from "@/components/SignIn";

export default async function Home() {
  const session = await auth();
  const user = {
    nombre: session?.user?.name ?? "",
    cargo: (session?.user as { cargo?: string })?.cargo ?? "",
    email: session?.user?.email ?? "",
  };

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900 dark:bg-black dark:text-zinc-50 sm:px-8">
      <div className="mx-auto w-full max-w-7xl rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-900">
        {session ? (
          <div className="space-y-6">
            <p className="text-xl font-semibold">Bienvenido {user.nombre || user.email || "Usuario"}</p>
            <Link
              href="/dashboard"
              className="inline-flex w-full items-center justify-center rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800 sm:w-fit"
            >
              Ir al Dashboard (Solo Gerencia)
            </Link>
            <CreateTicketForm currentUser={user} />
          </div>
        ) : (
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold">Ventanilla de Servicio Digital</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Ingresa con tu cuenta corporativa para gestionar tickets.
            </p>
            <SignIn />
          </div>
        )}
      </div>
    </main>
  );
}
