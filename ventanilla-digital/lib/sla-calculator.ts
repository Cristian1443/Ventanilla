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

export const calcularFechaSLA = (fechaBase: Date, prioridad: Prioridad) => {
  const dias = diasPorPrioridad[prioridad];
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

export const formatearFechaSLA = (fecha: Date) => {
  return fecha.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
