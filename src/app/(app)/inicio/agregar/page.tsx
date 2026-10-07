import Link from "next/link";
import {
  ArrowRight,
  FileSpreadsheet,
  LayoutTemplate,
  PencilLine,
  Sparkles,
} from "lucide-react";
import { EntryAvailability, EntryFrame } from "@/components/data-entry/frame";

export const metadata = { title: "Agregar información" };

export default function AddInformation() {
  const options = [
    {
      href: "/inicio/agregar/manual",
      icon: PencilLine,
      title: "Ingresarla ahora",
      description:
        "Empieza por lo que tienes a mano. Conoce las opciones para ingresar tus datos manualmente.",
      detail: "Entrada manual",
      recommended: true,
    },
    {
      href: "/inicio/agregar/archivo",
      icon: FileSpreadsheet,
      title: "Subir Excel o CSV",
      description:
        "¿Ya llevas tus números en un archivo? Este será el lugar para reunirlos en Minos.",
      detail: "Tus archivos existentes",
      recommended: false,
    },
    {
      href: "/inicio/agregar/plantilla",
      icon: LayoutTemplate,
      title: "Usar plantilla de Minos",
      description:
        "Conoce una estructura sencilla para organizar tu información antes de cargarla.",
      detail: "Una guía para organizarte",
      recommended: false,
    },
  ];
  return (
    <EntryFrame
      title="¿Cómo quieres agregar tu información?"
      description="Elige la forma que te resulte más cómoda. No necesitas tener todo organizado para dar el primer paso."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {options.map(
          ({ href, icon: Icon, title, description, detail, recommended }) => (
            <Link
              key={href}
              href={href}
              className={`group flex flex-col rounded-2xl border bg-card p-6 transition-colors hover:border-primary focus-visible:outline-primary ${recommended ? "border-primary/45" : "border-border"}`}
            >
              <div className="mb-6 flex min-h-10 items-center justify-between gap-2">
                <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-primary">
                  <Icon size={22} strokeWidth={1.7} />
                </span>
                {recommended && (
                  <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-medium text-accent-foreground">
                    Un buen comienzo
                  </span>
                )}
              </div>
              <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
              <p className="mb-7 mt-3 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
              <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4 text-xs font-medium text-primary">
                <span>{detail}</span>
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                />
              </div>
            </Link>
          ),
        )}
      </div>
      <div className="flex items-start gap-3 rounded-2xl bg-accent/50 px-5 py-4">
        <Sparkles size={20} className="mt-0.5 shrink-0 text-primary" />
        <div>
          <h2 className="text-sm font-medium">
            Lo esencial es suficiente para empezar.
          </h2>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">
            Puedes empezar con tan poco como tus ventas y gastos del mes.
          </p>
        </div>
      </div>
      <EntryAvailability />
    </EntryFrame>
  );
}
