import Link from "next/link";
import { ArrowLeft, ChevronRight, Info } from "lucide-react";

export function EntryFrame({
  title,
  description,
  current,
  children,
}: {
  title: string;
  description: string;
  current?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="fade-in mx-auto max-w-5xl space-y-7">
      <nav
        aria-label="Ruta de entrada de información"
        className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
      >
        <Link
          href="/inicio"
          className="hover:text-primary focus-visible:outline-primary"
        >
          Inicio
        </Link>
        <ChevronRight size={13} aria-hidden="true" />
        {current ? (
          <>
            <Link
              href="/inicio/agregar"
              className="hover:text-primary focus-visible:outline-primary"
            >
              Agregar información
            </Link>
            <ChevronRight size={13} aria-hidden="true" />
            <span aria-current="page" className="text-foreground">
              {current}
            </span>
          </>
        ) : (
          <span aria-current="page" className="text-foreground">
            Agregar información
          </span>
        )}
      </nav>
      <header>
        <p className="mb-3 text-xs font-semibold tracking-[.14em] text-primary">
          UN PASO SIMPLE PARA EMPEZAR
        </p>
        <h1 className="max-w-2xl text-[28px] leading-tight font-semibold tracking-tight sm:text-[34px]">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </header>
      {children}
      <Link
        href={current ? "/inicio/agregar" : "/inicio"}
        className="flex min-h-11 w-fit items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary focus-visible:outline-primary"
      >
        <ArrowLeft size={16} />
        {current ? "Volver a las opciones" : "Volver al inicio"}
      </Link>
    </div>
  );
}

export function EntryAvailability() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4 text-xs leading-6 text-muted-foreground">
      <Info
        size={17}
        className="mt-1 shrink-0 text-primary"
        aria-hidden="true"
      />
      <p>
        La entrada manual ya guarda tus datos y actualiza tus números. La carga
        de archivos y la plantilla estarán disponibles en otra etapa.
      </p>
    </div>
  );
}
