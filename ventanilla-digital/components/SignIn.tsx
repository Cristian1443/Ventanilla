"use client";

import { signIn } from "next-auth/react";

export default function SignIn() {
  return (
    <button
      type="button"
      onClick={() => signIn("microsoft-entra-id")}
      className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
    >
      Ingresar con Microsoft
    </button>
  );
}