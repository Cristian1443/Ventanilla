import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { isAdmin, isGerente } from "@/lib/config";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Solo proteger dashboard y admin
  const isDashboard = pathname.startsWith("/dashboard");
  const isAdminRoute = pathname.startsWith("/admin");
  if (!isDashboard && !isAdminRoute) return NextResponse.next();

  const session = await auth();
  const userEmail = session?.user?.email;

  // Si no hay sesión -> login
  if (!userEmail) {
    const loginUrl = new URL("/", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Si intenta /admin y no es admin ni gerente -> redirigir a dashboard o unauthorized
  if (isAdminRoute && !isAdmin(userEmail) && !isGerente(session.user.cargo)) {
    const unauthorized = new URL("/unauthorized", req.url);
    // Si no quieres página de no autorizado, cambia a "/dashboard"
    return NextResponse.redirect(unauthorized);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
