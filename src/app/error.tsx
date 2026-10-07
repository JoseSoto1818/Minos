"use client";
import { Button } from "@/components/ui/button";
import { CircleAlert } from "lucide-react";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-5 px-6 text-center">
      <CircleAlert className="size-10 text-warning" />
      <h1 className="text-2xl font-semibold">No pudimos cargar este espacio</h1>
      <p className="text-muted-foreground">
        Tus datos siguen guardados. Comprueba tu conexión y vuelve a intentarlo.
      </p>
      <Button onClick={reset}>Volver a intentar</Button>
      <a className="text-sm text-primary underline" href="/iniciar-sesion">
        Volver al acceso
      </a>
    </main>
  );
}
