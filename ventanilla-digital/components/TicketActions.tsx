"use client";

import * as React from "react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { assignTicket, closeTicket, startTicket } from "@/app/actions/manageTicket";

type TicketActionsProps = {
  id: number;
  estado: string;
};

export default function TicketActions({ id, estado }: TicketActionsProps) {
  const [email, setEmail] = React.useState("");
  const [isPending, startTransition] = React.useTransition();
  const [message, setMessage] = React.useState<string | null>(null);

  const onStart = () => {
    setMessage(null);
    startTransition(async () => {
      try {
        await startTicket(id);
        setMessage("Ticket en atención.");
        window.location.reload(); // Recargar para actualizar el estado
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error al iniciar atención";
        setMessage(errorMessage);
      }
    });
  };

  const onClose = () => {
    setMessage(null);
    startTransition(async () => {
      try {
        await closeTicket(id);
        setMessage("Ticket cerrado.");
        window.location.reload(); // Recargar para actualizar el estado
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error al cerrar ticket";
        setMessage(errorMessage);
      }
    });
  };

  const onAssign = () => {
    setMessage(null);
    if (!email) return;
    startTransition(async () => {
      try {
        await assignTicket(id, email);
        setMessage("Responsable asignado.");
        setEmail(""); // Limpiar el campo después de asignar
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error al asignar responsable";
        setMessage(errorMessage);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {estado === "Abierto" && (
          <Button type="button" onClick={onStart} disabled={isPending}>
            Iniciar Atención
          </Button>
        )}
        {estado === "En_Proceso" && (
          <Button type="button" onClick={onClose} disabled={isPending}>
            Cerrar Solicitud
          </Button>
        )}
      </div>

      {estado === "En_Proceso" && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Asignar Responsable
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="email"
              placeholder="correo@empresa.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isPending}
            />
            <Button type="button" variant="outline" onClick={onAssign} disabled={isPending || !email}>
              Asignar Responsable
            </Button>
          </div>
        </div>
      )}
      {estado !== "En_Proceso" && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">
          {estado === "Cerrado" 
            ? "No se puede asignar un responsable a un ticket cerrado."
            : "Solo se puede asignar un responsable cuando el ticket está en proceso."}
        </p>
      )}

      {message && (
        <p className={`text-sm ${
          message.includes("Error") || message.includes("No se puede") || message.includes("Solo se puede")
            ? "text-red-600 dark:text-red-400"
            : "text-green-600 dark:text-green-400"
        }`}>
          {message}
        </p>
      )}
    </div>
  );
}
