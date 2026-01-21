import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { auth } from "@/auth";

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

const ADMIN_EMAILS = ["pasantedesarrollo@investinbogota.org"];

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const userEmail = session?.user?.email ?? "";
  const showSidebar = Boolean(userEmail);
  const isAdmin = ADMIN_EMAILS.includes(userEmail);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {showSidebar ? <Sidebar isAdmin={isAdmin} /> : null}
        <main className={`min-h-screen ${showSidebar ? "pt-16 md:pt-0 md:pl-64" : ""}`}>{children}</main>
      </body>
    </html>
  );
}
