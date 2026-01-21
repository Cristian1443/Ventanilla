export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black px-4">
      <div className="max-w-md w-full space-y-4 text-center rounded-2xl bg-white dark:bg-zinc-900 shadow-sm p-8">
        <h1 className="text-2xl font-semibold text-red-600">No tienes permisos para ver esta sección</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Si crees que esto es un error, contacta al administrador.
        </p>
        <a
          href="/dashboard"
          className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
        >
          Volver al dashboard
        </a>
      </div>
    </main>
  );
}
