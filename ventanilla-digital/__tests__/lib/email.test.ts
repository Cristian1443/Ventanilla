import { sendAssignmentEmail, sendReminderEmail } from "@/lib/email";
import nodemailer from "nodemailer";

jest.mock("nodemailer");

const mockTransporter = {
  sendMail: jest.fn().mockResolvedValue({}),
};

describe("lib/email", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);
    process.env.SMTP_HOST = "smtp.test.com";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_USER = "test@example.com";
    process.env.SMTP_PASS = "testpass";
  });

  describe("sendAssignmentEmail", () => {
    it("debe enviar correo de asignación correctamente", async () => {
      await sendAssignmentEmail("user@example.com", 123, "CONSULTA");

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "user@example.com",
          subject: expect.stringContaining("Ticket #123"),
        })
      );
    });

    it("no debe fallar si no hay configuración SMTP", async () => {
      delete process.env.SMTP_HOST;
      (nodemailer.createTransport as jest.Mock).mockReturnValue(null);

      await expect(
        sendAssignmentEmail("user@example.com", 123, "CONSULTA")
      ).resolves.not.toThrow();
    });
  });

  describe("sendReminderEmail", () => {
    it("debe enviar correo de recordatorio correctamente", async () => {
      const fechaCompromiso = new Date("2024-12-31");
      await sendReminderEmail("user@example.com", 123, "CONSULTA", fechaCompromiso);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "user@example.com",
          subject: expect.stringContaining("Recordatorio"),
        })
      );
    });
  });
});
