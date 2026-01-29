import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { UserService } from "@/services/user.service";
import { cookies } from "next/headers";
import { getToken } from "next-auth/jwt";

export async function GET(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const cookieStore = await cookies();
  const token = await getToken({
    req: {
      headers: {
        cookie: cookieStore.toString(),
      },
    } as any,
    secret: process.env.AUTH_SECRET,
  });

  const accessToken = (token as { accessToken?: string })?.accessToken;

  if (!accessToken) {
    console.error("[search-user] No accessToken en token JWT");
    return NextResponse.json({ error: "Token no disponible" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Nombre muy corto" }, { status: 400 });
  }

  try {
    const results = await UserService.searchGraph(accessToken, name);
    return NextResponse.json({ results });
  } catch (error) {
    console.error("[search-user] Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
