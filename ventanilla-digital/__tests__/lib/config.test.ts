import { ADMIN_EMAILS, isAdmin } from "@/lib/config";

describe("lib/config", () => {
  describe("ADMIN_EMAILS", () => {
    it("debe incluir el email por defecto", () => {
      expect(ADMIN_EMAILS).toContain("pasantedesarrollo@investinbogota.org");
    });

    it("debe ser un array", () => {
      expect(Array.isArray(ADMIN_EMAILS)).toBe(true);
    });
  });

  describe("isAdmin", () => {
    it("debe retornar true para email de admin", () => {
      expect(isAdmin("pasantedesarrollo@investinbogota.org")).toBe(true);
    });

    it("debe retornar false para email no admin", () => {
      expect(isAdmin("usuario@example.com")).toBe(false);
    });

    it("debe retornar false para email null", () => {
      expect(isAdmin(null)).toBe(false);
    });

    it("debe retornar false para email undefined", () => {
      expect(isAdmin(undefined)).toBe(false);
    });

    it("debe ser case-insensitive", () => {
      expect(isAdmin("PASANTEDESARROLLO@INVESTINBOGOTA.ORG")).toBe(true);
    });
  });
});
