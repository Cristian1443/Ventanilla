"use server";

import { auth } from "@/auth";
import { isAdmin } from "@/lib/config";
import { checkAndSendReminders } from "./checkReminders";

export async function triggerManualReminders() {
    const session = await auth();
    if (!session?.user?.email) {
        throw new Error("No autorizado");
    }

    if (!isAdmin(session.user.email)) {
        throw new Error("Permisos insuficientes: Solo administradores");
    }

    // Llamar a la lógica compartida
    return checkAndSendReminders(1);
}
