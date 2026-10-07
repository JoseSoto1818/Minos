import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Check,
  CircleHelp,
  FileSpreadsheet,
  Layers3,
  LockKeyhole,
  MapPin,
  SlidersHorizontal,
  Sprout,
} from "lucide-react";
import { financialContext } from "@/lib/financial-data";
import { Dashboard } from "@/components/finance/dashboard";
import { businessTypes, countries } from "@/lib/constants";
import { Help } from "@/components/ui/help";

export const metadata = { title: "Inicio" };
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { company, records } = await financialContext();
  if (records.length)
    return (
      <Dashboard
        records={records}
        company={company}
        query={await searchParams}
      />
    );
  return (
    <div className="fade-in space-y-7">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 hidden text-xs font-medium text-muted-foreground sm:block">
            UN BUEN LUGAR PARA EMPEZAR
          </p>
          <h1 className="text-[28px] font-semibold tracking-tight sm:text-[32px]">
            Bienvenido a tu espacio.
          </h1>
          <p className="mt-2 hidden text-sm text-muted-foreground sm:block">
            Cada gran negocio se construye una decisión a la vez.
          </p>
        </div>
        <span className="mt-1 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-success" />
          Configuración completa
        </span>
      </section>
      <section className="relative overflow-hidden rounded-[20px] border border-border bg-card">
        <div className="grid lg:grid-cols-[1.25fr_1fr]">
          <div className="px-6 py-7 sm:p-10">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-[11px] font-medium text-accent-foreground sm:mb-6">
              <Sprout size={14} />
              AQUÍ EMPIEZA TU CLARIDAD
            </span>
            <h2 className="max-w-md text-[26px] leading-[1.18] font-medium tracking-[-1px] sm:text-[38px]">
              Tu negocio tiene una historia.
              <br />
              <span className="text-primary">Démosle claridad.</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground sm:mt-5 sm:leading-7">
              El espacio de {company.name} está listo. Elige cómo agregar tu
              información.
            </p>
            <Link
              href="/inicio/agregar"
              className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90 focus-visible:outline-primary sm:w-auto"
            >
              Agregar mis números
              <ArrowRight size={16} />
            </Link>
            <p className="mt-4 text-xs text-muted-foreground">
              Puedes empezar con tan poco como tus ventas y gastos del mes.
            </p>
          </div>
          <div
            className="relative flex min-h-64 items-center justify-center bg-accent/40 p-8"
            aria-hidden="true"
          >
            <div className="absolute size-64 rounded-full border border-primary/10" />
            <div className="absolute size-80 rounded-full border border-primary/5" />
            <div className="relative w-56 -rotate-3 rounded-2xl border border-border bg-card p-6 shadow-[0_8px_40px_-16px_#147d9230]">
              <div className="mb-6 flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary">
                  <Building2 size={21} />
                </span>
                <span className="flex size-6 items-center justify-center rounded-full bg-success/10 text-success">
                  <Check size={13} />
                </span>
              </div>
              <p className="truncate text-base font-semibold">{company.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Un nuevo comienzo
              </p>
              <div className="my-5 h-px bg-border" />
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">
                  Tu espacio está listo
                </span>
              </div>
            </div>
            <span className="absolute bottom-10 right-7 flex rotate-6 items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-xs text-primary shadow-sm">
              <Layers3 size={17} />
              Paso a paso, más claro.
            </span>
          </div>
        </div>
      </section>
      <section>
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-base font-semibold">Un comienzo simple</h2>
          <Help title="Tu primer paso">
            Tu empresa ya está configurada. En “Agregar mis números” puedes
            registrar ingresos, gastos, cuentas, activos y préstamos.
          </Help>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              n: "01",
              icon: Building2,
              title: "Un espacio para tu negocio",
              copy: "Tu empresa, tu moneda y tu forma de trabajar. Ya tenemos lo esencial.",
              ready: true,
            },
            {
              n: "02",
              icon: FileSpreadsheet,
              title: "Elige cómo empezar",
              copy: "Conoce la entrada manual, la carga de archivos y la plantilla de Minos.",
              ready: false,
              href: "/inicio/agregar",
            },
            {
              n: "03",
              icon: SlidersHorizontal,
              title: "Más claridad para decidir",
              copy: "Consulta tus ingresos, gastos y resultados a partir de tus registros.",
              ready: false,
              href: "/historial",
            },
          ].map(({ n, icon: Icon, title, copy, ready, href }) => (
            <article
              key={n}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <Icon size={18} />
                </span>
                <span className="text-xs tabular-nums text-muted-foreground/60">
                  {n}
                </span>
              </div>
              <h3 className="text-sm font-semibold">{title}</h3>
              <p className="mb-5 mt-2 text-xs leading-6 text-muted-foreground">
                {copy}
              </p>
              {href ? (
                <Link
                  href={href}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline focus-visible:outline-primary"
                >
                  Ver opciones
                  <ArrowRight size={14} />
                </Link>
              ) : (
                <span
                  className={
                    ready
                      ? "inline-flex items-center gap-1.5 text-xs text-success"
                      : "inline-flex items-center gap-1.5 text-xs text-muted-foreground"
                  }
                >
                  {ready ? <Check size={14} /> : <LockKeyhole size={12} />}{" "}
                  {ready ? "Listo para ti" : "Próximamente"}
                </span>
              )}
            </article>
          ))}
        </div>
      </section>
      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              Tu negocio, en pocas palabras
            </h2>
            <Link
              href="/configuracion"
              className="text-xs font-medium text-primary"
            >
              Ver configuración →
            </Link>
          </div>
          <dl className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            <div>
              <dt className="mb-1.5 text-xs text-muted-foreground">País</dt>
              <dd className="flex items-center gap-1.5 text-sm">
                <MapPin size={14} className="text-muted-foreground" />
                {countries.find((c) => c.code === company.country_code)?.name ??
                  company.country_code}
              </dd>
            </div>
            <div>
              <dt className="mb-1.5 text-xs text-muted-foreground">
                Moneda principal
              </dt>
              <dd className="text-sm">{company.base_currency}</dd>
            </div>
            <div>
              <dt className="mb-1.5 text-xs text-muted-foreground">
                Tu actividad
              </dt>
              <dd className="text-sm">
                {businessTypes[company.business_type]}
              </dd>
            </div>
          </dl>
        </section>
        <section className="flex items-start gap-4 rounded-2xl border border-border bg-accent/35 p-6">
          <CircleHelp size={22} className="shrink-0 text-primary" />
          <div>
            <h2 className="text-sm font-medium">
              No necesitas saber de finanzas.
            </h2>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              Este espacio está pensado para hablar tu idioma y ayudarte a
              entender, paso a paso.
            </p>
            <Link
              href="/guia"
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary"
            >
              Conoce Minos
              <ArrowRight size={13} />
            </Link>
          </div>
        </section>
      </div>
      <p className="text-center text-[11px] text-muted-foreground">
        Aún no has agregado información financiera. Aquí verás tus resultados
        cuando registres tus primeros números.
      </p>
    </div>
  );
}
