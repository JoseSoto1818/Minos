import Link from "next/link";
import {
  ArrowRight,
  Compass,
  HeartHandshake,
  ShieldCheck,
  Sprout,
} from "lucide-react";
export const metadata = { title: "Conoce Minos" };
export default function Guide() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="text-xs font-semibold tracking-widest text-primary">
          A TU RITMO
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Un poco de claridad cambia mucho.
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          Minos es un espacio para entender y gestionar las finanzas de tu
          negocio. Complementa tu contabilidad y pone tus números en palabras
          que tienen sentido para ti.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          {
            Icon: Sprout,
            title: "Empieza con lo esencial",
            text: "Tu empresa ya tiene su espacio. No necesitas organizar toda tu información para comenzar.",
          },
          {
            Icon: Compass,
            title: "Lo que puedes hacer hoy",
            text: "Registra ingresos, gastos, cuentas, activos y préstamos. Consulta tus números en Inicio y edita tus registros desde Historial.",
          },
          {
            Icon: HeartHandshake,
            title: "Lo que viene después",
            text: "La carga de archivos y las herramientas avanzadas llegarán en otra etapa. Tus indicadores actuales se calculan únicamente con los datos que registras.",
          },
          {
            Icon: ShieldCheck,
            title: "Cada negocio tiene su lugar",
            text: "Solo las personas con acceso a una empresa pueden consultar sus datos. Tu rol determina qué puedes cambiar.",
          },
        ].map(({ Icon, title, text }) => (
          <section
            key={title}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <Icon className="mb-4 text-primary" size={23} />
            <h2 className="font-medium">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {text}
            </p>
          </section>
        ))}
      </div>
      <Link
        href="/inicio"
        className="inline-flex items-center gap-2 text-sm font-medium text-primary"
      >
        Volver a mi espacio
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
