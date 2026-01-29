export type Prioridad = "ALTA" | "MEDIA" | "BAJA";

const diasPorPrioridad: Record<Prioridad, number> = {
  ALTA: 1,
  MEDIA: 3,
  BAJA: 5,
};

// Festivos de Colombia 2025-2026 (Ejemplo parcial - debe actualizarse anualmente)
const DIAS_FESTIVOS = [
  "2025-01-01", "2025-01-06", "2025-03-24", "2025-04-17", "2025-04-18", "2025-05-01",
  "2025-06-02", "2025-06-23", "2025-06-30", "2025-07-20", "2025-08-07", "2025-08-18",
  "2025-10-13", "2025-11-03", "2025-11-17", "2025-12-08", "2025-12-25",
  "2026-01-01",
];

const esDiaNoHabil = (fecha: Date) => {
  const dia = fecha.getDay();
  // 0 = Domingo, 6 = Sábado
  if (dia === 0 || dia === 6) return true;

  // Formato YYYY-MM-DD para comparar con lista
  const fechaString = fecha.toISOString().split("T")[0];
  return DIAS_FESTIVOS.includes(fechaString);
};

export const calcularFechaSLAPorDiasHabiles = (fechaBase: Date, diasHabiles: number) => {
  const dias = Math.max(0, Math.floor(Number(diasHabiles) || 0));
  const resultado = new Date(fechaBase);
  let agregados = 0;

  // Si empezamos en día no hábil, avanzar hasta el primer hábil antes de contar
  while (esDiaNoHabil(resultado)) {
    resultado.setDate(resultado.getDate() + 1);
  }

  while (agregados < dias) {
    resultado.setDate(resultado.getDate() + 1);
    if (!esDiaNoHabil(resultado)) {
      agregados += 1;
    }
  }

  return resultado;
};

export const calcularFechaSLA = (fechaBase: Date, prioridad: Prioridad) => {
  return calcularFechaSLAPorDiasHabiles(fechaBase, diasPorPrioridad[prioridad]);
};

export const formatearFechaSLA = (fecha: Date) => {
  return fecha.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
