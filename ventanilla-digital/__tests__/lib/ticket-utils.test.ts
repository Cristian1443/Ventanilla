import { mapTipoEntidad, mapPrioridad } from "@/lib/ticket-utils";

describe("lib/ticket-utils", () => {
  describe("mapTipoEntidad", () => {
    it("debe mapear PERSONA_NATURAL correctamente", () => {
      expect(mapTipoEntidad("PERSONA_NATURAL")).toBe("Persona_Natural");
    });

    it("debe mapear EMPRESA_LOCAL correctamente", () => {
      expect(mapTipoEntidad("EMPRESA_LOCAL")).toBe("Empresa_Local");
    });

    it("debe mapear EMPRESA_EXTRANJERA correctamente", () => {
      expect(mapTipoEntidad("EMPRESA_EXTRANJERA")).toBe("Empresa_Extranjera");
    });
  });

  describe("mapPrioridad", () => {
    it("debe mapear ALTA correctamente", () => {
      expect(mapPrioridad("ALTA")).toBe("Alta");
    });

    it("debe mapear MEDIA correctamente", () => {
      expect(mapPrioridad("MEDIA")).toBe("Media");
    });

    it("debe mapear BAJA correctamente", () => {
      expect(mapPrioridad("BAJA")).toBe("Baja");
    });
  });
});
