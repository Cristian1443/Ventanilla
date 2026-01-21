"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

const linkBase =
  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition";
const linkInactive = "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800";
const linkActive = "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50";

export default function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex h-full flex-col justify-between">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Ventanilla Digital
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Gestión de Tickets
            </p>
          </div>

          <nav className="space-y-2">
            <Link
              href="/"
              className={`${linkBase} ${pathname === "/" ? linkActive : linkInactive}`}
            >
              Crear Ticket
            </Link>
            <Link
              href="/dashboard"
              className={`${linkBase} ${pathname.startsWith("/dashboard") && !pathname.startsWith("/admin") ? linkActive : linkInactive}`}
            >
              Dashboard
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className={`${linkBase} ${pathname.startsWith("/admin") ? linkActive : linkInactive}`}
              >
                Alta Gerencia
              </Link>
            )}
          </nav>
        </div>

        <button
          type="button"
          onClick={async () => {
            await signOut({ callbackUrl: "/" });
            router.refresh();
          }}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
