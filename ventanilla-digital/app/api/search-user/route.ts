import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getToken } from "next-auth/jwt";

export async function GET(request: Request) {
  const session = await auth();
  
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Obtener el token JWT desde las cookies
  const cookieStore = await cookies();
  const token = await getToken({ 
    req: {
      headers: {
        cookie: cookieStore.toString(),
      },
    } as any,
    secret: process.env.AUTH_SECRET,
  });
  
  const accessToken = (token as any)?.accessToken;

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
    // Escapar comillas simples para no romper el $filter de OData
    const safeName = name.replace(/'/g, "''");
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/users?$filter=startswith(displayName,'${encodeURIComponent(
        safeName
      )}')&$select=displayName,mail,userPrincipalName,jobTitle,department&$top=5`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[search-user] Graph API error: ${response.status} - ${errorText}`);
      return NextResponse.json({ error: "Error al buscar usuario" }, { status: response.status });
    }

    const data = (await response.json()) as {
      value?: Array<{
        displayName?: string;
        mail?: string;
        userPrincipalName?: string;
        jobTitle?: string;
        department?: string;
      }>;
    };
    
    if (data.value && data.value.length > 0) {
      const results = data.value
        .map((u) => ({
          nombre: u.displayName || "",
          // En muchos tenants "mail" viene vacío; usar UPN como fallback
          email: u.mail || u.userPrincipalName || "",
          cargo: u.jobTitle || "",
          gerencia: u.department || "",
        }))
        .filter((u) => u.nombre || u.email);

      return NextResponse.json({ results });
    }

    return NextResponse.json({ results: [] });
  } catch (error) {
    console.error("[search-user] Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
