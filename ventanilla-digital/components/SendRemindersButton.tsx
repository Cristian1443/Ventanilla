"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { triggerManualReminders } from "@/app/actions/triggerReminders";

export default function SendRemindersButton() {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<{
    success: boolean;
    mensaje?: string;
    resultados?: {
      total: number;
      enviados: number;
      errores: number;
    };
  } | null>(null);

  const handleSendReminders = async () => {
    setLoading(true);
    setResultado(null);

    try {
      const data = await triggerManualReminders();
      setResultado({
        success: true,
        mensaje: `Verificación completada. ${data.enviados} recordatorios enviados.`,
        resultados: data
      });
    } catch (error) {
      setResultado({
        success: false,
        mensaje: error instanceof Error ? error.message : "Error desconocido",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handleSendReminders}
        disabled={loading}
        className="w-full bg-[#E84922] hover:bg-[#cf3d1f] text-white"
      >
        {loading ? "Enviando recordatorios..." : "Enviar Recordatorios de Tickets Próximos a Vencer"}
      </Button>

      {resultado && (
        <div
          className={`p-3 rounded-md text-sm ${resultado.success
            ? "bg-green-50 text-green-800 border border-green-200"
            : "bg-red-50 text-red-800 border border-red-200"
            }`}
        >
          <p className="font-semibold mb-1">
            {resultado.success ? "✓ Éxito" : "✗ Error"}
          </p>
          {resultado.mensaje && <p className="mb-2">{resultado.mensaje}</p>}
          {resultado.resultados && (
            <div className="text-xs space-y-1">
              <p>Total tickets encontrados: {resultado.resultados.total}</p>
              <p>Recordatorios enviados: {resultado.resultados.enviados}</p>
              {resultado.resultados.errores > 0 && (
                <p className="text-red-600">
                  Errores: {resultado.resultados.errores}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
