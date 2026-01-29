"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, Menu, X } from "lucide-react";

const links = (showAdmin: boolean, pathname: string) => [
    { href: "/dashboard", label: "Inicio", active: pathname === "/dashboard" },
    { href: "/solicitud", label: "Crear Solicitud", active: pathname === "/solicitud" },
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


export default function TopNavbar({
    isAdmin = false,
    isManager = false,
    userName = "USUARIO",
}: {
    isAdmin?: boolean;
    isManager?: boolean;
    userName?: string;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const showAdmin = isAdmin || isManager;

    const displayUserName = userName?.toUpperCase() || "USUARIO";

    const handleSignOut = async () => {
        await signOut({ callbackUrl: "/" });
        router.refresh();
    };

    const navLinks = links(showAdmin, pathname);

    return (
        <div className="w-full font-sans">
            {/* Top White Bar */}
            <div className="bg-white px-4 py-3 sm:px-8 border-b border-gray-100 flex justify-between items-center">
                {/* Left: Logos */}
                <div className="flex items-center gap-6">
                    <Link href="/dashboard" className="flex items-center">
                        {/* Logo Invest in Bogota - Using existing logo.svg */}
                        <Image
                            src="/logo.svg"
                            alt="Invest in Bogotá"
                            width={160}
                            height={50}
                            className="h-10 w-auto object-contain"
                            priority
                        />
                    </Link>


                </div>

                {/* Right: User & Actions */}
                <div className="flex items-center gap-6">
                    <div className="hidden md:block text-right">
                        <p className="text-sm font-semibold text-zinc-800 tracking-wide">{displayUserName}</p>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="rounded-full bg-black text-white p-2 hover:bg-zinc-800 transition shadow-md"
                        title="Cerrar Sessión"
                    >
                        <LogOut className="h-5 w-5" />
                    </button>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-zinc-600"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Orange Navigation Bar */}
            <div className="bg-[#E84922] text-white hidden md:block">
                <div className="px-4 sm:px-8 flex items-center h-12 gap-8 text-sm font-medium">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`h-full flex items-center px-4 border-b-4 transition-colors ${link.active
                                ? "border-white bg-[#cf3d1f]"
                                : "border-transparent hover:bg-[#cf3d1f] hover:border-[#cf3d1f]"
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Mobile Navigation Dropdown */}
            {open && (
                <div className="md:hidden bg-[#E84922] text-white p-4 space-y-2">
                    <div className="pb-2 border-b border-white/20 mb-2">
                        <p className="text-xs font-semibold uppercase opacity-75">Usuario</p>
                        <p className="text-base font-bold">{displayUserName}</p>
                    </div>
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setOpen(false)}
                            className={`block py-2 px-3 rounded ${link.active ? "bg-white text-[#E84922] font-bold" : "hover:bg-[#cf3d1f]"
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
