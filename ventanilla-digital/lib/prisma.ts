import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Normaliza la URL de conexión a PostgreSQL agregando el parámetro SSL explícito
 * para evitar warnings de seguridad en versiones futuras de pg-connection-string
 */
function normalizeDatabaseUrl(url: string): string {
  try {
    const urlObj = new URL(url);



    // Solo agregar sslmode si no estamos en localhost para permitir desarrollo local sin SSL
    if (urlObj.hostname !== "localhost" && urlObj.hostname !== "127.0.0.1" && !urlObj.searchParams.has("sslmode")) {
      urlObj.searchParams.set("sslmode", "verify-full");
    }

    return urlObj.toString();
  } catch {
    // Si no es una URL válida, retornar tal cual
    return url;
  }
}

/**
 * Obtiene una instancia singleton de PrismaClient
 * Normaliza la URL de conexión para evitar warnings de SSL
 */
export function getPrismaClient(): PrismaClient | null {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  const globalForPrisma = globalThis as typeof globalThis & { prisma?: PrismaClient };

  if (!globalForPrisma.prisma) {
    const normalizedUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);

    globalForPrisma.prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString: normalizedUrl }),
    });
  }

  return globalForPrisma.prisma;
}
