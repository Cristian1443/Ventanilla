export type Prioridad = "ALTA" | "MEDIA" | "BAJA";

const diasPorPrioridad: Record<Prioridad, number> = {
  ALTA: 1,
  MEDIA: 3,
  BAJA: 5,
};

const esFinDeSemana = (fecha: Date) => {
  const dia = fecha.getDay();
  return dia === 0 || dia === 6;
};

export const calcularFechaSLAPorDiasHabiles = (fechaBase: Date, diasHabiles: number) => {
  const dias = Math.max(0, Math.floor(Number(diasHabiles) || 0));
  const resultado = new Date(fechaBase);
  let agregados = 0;

  while (agregados < dias) {
    resultado.setDate(resultado.getDate() + 1);
    if (!esFinDeSemana(resultado)) {
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
