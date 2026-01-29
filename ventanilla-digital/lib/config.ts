/**
 * Configuración centralizada de la aplicación
 */

export const ADMIN_EMAILS = [
  ...(process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
];


export const isAdmin = (email?: string | null): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

export const isGerente = (cargo?: string | null): boolean => {
  if (!cargo) return false;
  return cargo.toLowerCase().includes("gerente");
};
