import {
  calcularFechaSLAPorDiasHabiles,
  calcularFechaSLA,
  formatearFechaSLA,
  type Prioridad,
} from "@/lib/sla-calculator";

describe("lib/sla-calculator", () => {
  describe("calcularFechaSLAPorDiasHabiles", () => {
    it("debe calcular correctamente 1 día hábil", () => {
      const fechaBase = new Date("2024-01-15T10:00:00Z"); // Lunes
      const resultado = calcularFechaSLAPorDiasHabiles(fechaBase, 1);
      const esperado = new Date("2024-01-16T10:00:00Z"); // Martes

      expect(resultado.getDate()).toBe(esperado.getDate());
      expect(resultado.getMonth()).toBe(esperado.getMonth());
      expect(resultado.getFullYear()).toBe(esperado.getFullYear());
    });

    it("debe saltar fines de semana", () => {
      const fechaBase = new Date("2024-01-19T10:00:00Z"); // Viernes
      const resultado = calcularFechaSLAPorDiasHabiles(fechaBase, 1);
      
      // Debe ser lunes (día 22)
      expect(resultado.getDay()).toBe(1); // Lunes
      expect(resultado.getDate()).toBeGreaterThan(19);
    });

    it("debe calcular correctamente múltiples días hábiles", () => {
      const fechaBase = new Date("2024-01-15T10:00:00Z"); // Lunes
      const resultado = calcularFechaSLAPorDiasHabiles(fechaBase, 5);
      
      // 5 días hábiles desde lunes = siguiente lunes
      expect(resultado.getDay()).toBe(1); // Lunes
      expect(resultado.getDate()).toBeGreaterThan(15);
    });
  });

  describe("calcularFechaSLA", () => {
    it("debe calcular SLA para prioridad ALTA (1 día)", () => {
      const fechaBase = new Date("2024-01-15");
      const resultado = calcularFechaSLA(fechaBase, "ALTA");
      const esperado = calcularFechaSLAPorDiasHabiles(fechaBase, 1);

      expect(resultado.toDateString()).toBe(esperado.toDateString());
    });

    it("debe calcular SLA para prioridad MEDIA (3 días)", () => {
      const fechaBase = new Date("2024-01-15");
      const resultado = calcularFechaSLA(fechaBase, "MEDIA");
      const esperado = calcularFechaSLAPorDiasHabiles(fechaBase, 3);

      expect(resultado.toDateString()).toBe(esperado.toDateString());
    });

    it("debe calcular SLA para prioridad BAJA (5 días)", () => {
      const fechaBase = new Date("2024-01-15");
      const resultado = calcularFechaSLA(fechaBase, "BAJA");
      const esperado = calcularFechaSLAPorDiasHabiles(fechaBase, 5);

      expect(resultado.toDateString()).toBe(esperado.toDateString());
    });
  });

  describe("formatearFechaSLA", () => {
    it("debe formatear fecha correctamente", () => {
      const fecha = new Date("2024-01-15T12:00:00Z");
      const resultado = formatearFechaSLA(fecha);

      expect(resultado).toContain("2024");
      expect(resultado).toMatch(/\d+/); // Debe contener números
    });
  });
});
