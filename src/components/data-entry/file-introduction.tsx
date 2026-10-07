import Link from "next/link";
import {
  ArrowRight,
  FileSpreadsheet,
  FileText,
  LayoutTemplate,
  Upload,
} from "lucide-react";
import { EntryFrame } from "./frame";
import { Button } from "@/components/ui/button";

export function FileIntroduction({ template = false }: { template?: boolean }) {
  const title = template ? "Usar plantilla de Minos" : "Subir Excel o CSV";
  const Icon = template ? LayoutTemplate : Upload;
  return (
    <EntryFrame
      current={template ? "Plantilla de Minos" : "Archivo"}
      title={title}
      description={
        template
          ? "Una estructura sencilla para ordenar los números de tu negocio, a tu ritmo."
          : "Si ya llevas tus números en un archivo, podrás empezar con lo que tienes."
      }
    >
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <span className="flex size-12 items-center justify-center rounded-xl bg-accent text-primary">
            <Icon size={24} />
          </span>
          <span className="rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">
            Próximamente
          </span>
        </div>
        <h2 className="mt-6 text-xl font-semibold tracking-tight">
          {template
            ? "Un lugar para cada dato"
            : "Tus archivos también tienen un lugar"}
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
          {template
            ? "La plantilla te ayudará a organizar fecha, descripción, valor y tipo de movimiento. No necesitarás completar detalles que todavía no conozcas."
            : "Podrás usar archivos Excel (.xlsx) o CSV, sin tener que copiar todo a mano. Más adelante podrás revisar cómo se organizan los datos antes de agregarlos a tu negocio."}
        </p>
        {template ? (
          <div
            className="my-7 grid grid-cols-2 gap-3 sm:grid-cols-4"
            aria-label="Campos previstos de la plantilla"
          >
            {["Fecha", "Descripción", "Valor", "Tipo"].map((label) => (
              <div
                key={label}
                className="rounded-xl border border-border bg-background px-4 py-5 text-sm font-medium"
              >
                {label}
              </div>
            ))}
          </div>
        ) : (
          <div className="my-7 flex flex-wrap gap-3">
            {[
              { Icon: FileSpreadsheet, label: "Excel · .xlsx" },
              { Icon: FileText, label: "Archivo · .csv" },
            ].map(({ Icon: FileIcon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground"
              >
                <FileIcon size={18} />
                {label}
              </span>
            ))}
          </div>
        )}
        <p
          id="file-availability"
          className="mb-5 text-xs leading-6 text-muted-foreground"
        >
          {template
            ? "La descarga de la plantilla estará disponible próximamente."
            : "La selección y carga de archivos estarán disponibles próximamente. Por ahora no se envían ni procesan archivos."}
        </p>
        <Button disabled aria-describedby="file-availability" variant="outline">
          {template ? <LayoutTemplate /> : <Upload />}
          {template ? "Descargar plantilla" : "Seleccionar archivo"}
        </Button>
      </section>
      <Link
        href="/inicio/agregar/manual"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary hover:underline focus-visible:outline-primary"
      >
        Conocer la entrada manual
        <ArrowRight size={16} />
      </Link>
    </EntryFrame>
  );
}
