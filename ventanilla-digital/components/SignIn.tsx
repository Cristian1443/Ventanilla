"use client";

import { signIn } from "next-auth/react";

export default function SignIn() {
  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() =>
          signIn("microsoft-entra-id", {
            // Siempre mostrar selector de cuenta en Microsoft
            prompt: "select_account",
          })
        }
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#E84922] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#cf3d1f] focus:outline-none focus:ring-2 focus:ring-[#E84922]/40 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
      >
        
        <span>Ingresar con Microsoft</span>
      </button>
      <p className="text-xs text-zinc-500">
        Al ingresar podrás seleccionar o cambiar de cuenta en la ventana de Microsoft.
      </p>
    </div>
  );
}