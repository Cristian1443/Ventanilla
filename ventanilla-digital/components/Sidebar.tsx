"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";

const linkBase = "flex items-center rounded-md px-3 py-2 text-sm font-medium transition";
const linkInactive = "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800";
const linkActive = "bg-[#E84922]/10 text-[#E84922] dark:bg-[#E84922]/20 dark:text-[#E84922]";

const links = (showAdmin: boolean, pathname: string) => [
  { href: "/", label: "Crear Solicitud", active: pathname === "/" },
  {
    href: "/dashboard",
    label: "Dashboard",
    active: pathname.startsWith("/dashboard") && !pathname.startsWith("/admin"),
  },
  ...(showAdmin
    ? [
      {
        href: "/admin",
        label: "Alta Gerencia",
        active: pathname.startsWith("/admin"),
      },
    ]
    : []),
];

function NavLinks({
  showAdmin,
  pathname,
  onNavigate,
}: {
  showAdmin: boolean;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-2">
      {links(showAdmin, pathname).map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`${linkBase} ${item.active ? linkActive : linkInactive}`}
          onClick={onNavigate}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export default function Sidebar({
  isAdmin = false,
  isManager = false,
}: {
  isAdmin?: boolean;
  isManager?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const showAdmin = isAdmin || isManager;

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
    router.refresh();
  };

  const closeMenu = () => setOpen(false);

  return (
    <>
      {/* Barra superior móvil */}
      <div className="md:hidden sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.svg"
              alt="Invest in Bogotá"
              width={160}
              height={50}
              className="h-12 w-auto object-contain"
              priority
            />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-900 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Overlay móvil */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-zinc-200 bg-white p-6 shadow-lg transition-transform duration-200 dark:border-zinc-800 dark:bg-zinc-900 md:z-40 md:translate-x-0 md:shadow-none ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
      >
        <div className="flex h-full flex-col justify-between">
          <div className="space-y-6">
            <div className="hidden md:block">
              <Link href="/" className="flex items-center justify-center mb-4">
                <Image
                  src="/logo.svg"
                  alt="Invest in Bogotá"
                  width={220}
                  height={68}
                  className="h-16 w-auto object-contain"
                  priority
                />
              </Link>
            </div>

            <NavLinks showAdmin={showAdmin} pathname={pathname} onNavigate={closeMenu} />
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
