import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopNavbar from "@/components/TopNavbar";
import { auth } from "@/auth";
import { isAdmin, isGerente } from "@/lib/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ventanilla Digital",
  description: "Sistema de gestión de solicitudes - Invest in Bogotá",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const userEmail = session?.user?.email ?? "";
  const showSidebar = Boolean(userEmail); // Still useful to toggle nav visibility
  const userIsAdmin = isAdmin(userEmail);
  const userIsManager = isGerente(session?.user?.cargo);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50 dark:bg-zinc-950`}
      >
        {showSidebar ? <TopNavbar isAdmin={userIsAdmin} isManager={userIsManager} userName={session?.user?.name || undefined} /> : null}
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
