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
      await startTicket(id);
      setMessage("Ticket en atención.");
    });
  };

  const onClose = () => {
    setMessage(null);
    startTransition(async () => {
      await closeTicket(id);
      setMessage("Ticket cerrado.");
    });
  };

  const onAssign = () => {
    setMessage(null);
    if (!email) return;
    startTransition(async () => {
      await assignTicket(id, email);
      setMessage("Responsable asignado.");
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
            Cerrar Ticket
          </Button>
        )}
      </div>

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
          />
          <Button type="button" variant="outline" onClick={onAssign} disabled={isPending}>
            Asignar Responsable
          </Button>
        </div>
      </div>

      {message && (
        <p className="text-sm text-zinc-600 dark:text-zinc-300">{message}</p>
      )}
    </div>
  );
}
