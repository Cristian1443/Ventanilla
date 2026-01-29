import { NextResponse } from "next/server";
import { checkAndSendReminders } from "@/app/actions/checkReminders";

/**
 * API Route para verificar y enviar recordatorios de tickets próximos a vencer
 * Se puede llamar manualmente o configurar como cron job
 * 
 * Ejemplo de uso con cron (Vercel Cron, etc.):
 * GET /api/reminders?dias=1
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dias = searchParams.get("dias");
    const diasAnticipacion = dias ? parseInt(dias, 10) : 1;

    if (isNaN(diasAnticipacion) || diasAnticipacion < 0) {
      return NextResponse.json(
        { error: "El parámetro 'dias' debe ser un número positivo" },
        { status: 400 }
      );
    }

    const resultados = await checkAndSendReminders(diasAnticipacion);

    return NextResponse.json({
      success: true,
      mensaje: `Verificación completada. ${resultados.enviados} recordatorios enviados.`,
      resultados,
    });
  } catch (error) {
    console.error("[API /reminders] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
