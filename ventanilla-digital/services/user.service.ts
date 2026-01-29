import { getPrismaClient } from "@/lib/prisma";

export interface UserResult {
    nombre: string;
    email: string;
    cargo: string;
    gerencia: string;
}

export class UserService {
    /**
     * Busca usuarios locales basados en tickets previos
     */
    static async searchLocal(query: string, limit: number = 20): Promise<UserResult[]> {
        if (!query || query.length < 2) return [];

        const prisma = getPrismaClient();
        if (!prisma) throw new Error("Database connection failed");

        const usersCreated = await prisma.ticket.findMany({
            where: {
                usuarioNombre: { contains: query, mode: "insensitive" }
            },
            select: {
                usuarioNombre: true,
                usuarioEmail: true,
                usuarioCargo: true,
                usuarioGerencia: true
            },
            distinct: ['usuarioEmail'],
            take: limit
        });

        return usersCreated.map(u => ({
            nombre: u.usuarioNombre,
            email: u.usuarioEmail,
            cargo: u.usuarioCargo || "",
            gerencia: u.usuarioGerencia || ""
        }));
    }

    /**
     * Busca usuarios en Microsoft Graph API
     */
    static async searchGraph(accessToken: string, name: string): Promise<UserResult[]> {
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
            throw new Error(`Graph API error: ${response.status}`);
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
            return data.value
                .map((u) => ({
                    nombre: u.displayName || "",
                    email: u.mail || u.userPrincipalName || "",
                    cargo: u.jobTitle || "",
                    gerencia: u.department || "",
                }))
                .filter((u) => u.nombre || u.email);
        }

        return [];
    }

    // Compatibilidad con nombre anterior si se requiere
    static async searchByName(query: string, limit: number = 20) {
        return this.searchLocal(query, limit);
    }
}
