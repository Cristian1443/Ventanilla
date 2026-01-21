import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Normaliza la URL de conexión a PostgreSQL agregando el parámetro SSL explícito
 * para evitar warnings de seguridad en versiones futuras de pg-connection-string
 */
function normalizeDatabaseUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Si ya tiene sslmode, no hacer nada
    if (urlObj.searchParams.has("sslmode")) {
      return url;
    }
    
    // Agregar sslmode=verify-full explícitamente
    urlObj.searchParams.set("sslmode", "verify-full");
    
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
