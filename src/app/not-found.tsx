import Link from "next/link";
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="text-sm font-medium text-primary">MINOS · 404</p>
      <h1 className="text-3xl font-semibold">Esta página no está aquí</h1>
      <p className="text-muted-foreground">
        Volvamos a tu espacio para seguir.
      </p>
      <Link
        href="/"
        className="rounded-xl bg-primary px-5 py-3 text-sm text-primary-foreground"
      >
        Ir al inicio
      </Link>
    </main>
  );
}
