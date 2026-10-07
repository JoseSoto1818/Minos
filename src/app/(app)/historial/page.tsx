import Link from "next/link";
import { financialContext } from "@/lib/financial-data";
import { kinds, cents, decimal, categories } from "@/lib/finance";
import { HistoryActions } from "@/components/finance/history-actions";
export default async function History({
  searchParams,
}: {
  searchParams: Promise<{ vista?: string; guardado?: string }>;
}) {
  const { vista, guardado } = await searchParams;
  const { company, records } = await financialContext();
  const closed = vista === "cerrados";
  const rows = records.filter((r) => Boolean(r.closed_at) === closed);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">Historial</h1>
        <Link className="text-sm text-primary" href="/inicio/agregar/manual">
          Agregar información →
        </Link>
      </div>
      <Link className="text-sm text-primary" href="/inicio">
        ← Inicio
      </Link>
      {guardado && (
        <p role="status" className="text-success">
          Registro guardado.
        </p>
      )}
      <nav aria-label="Estado de registros" className="flex gap-4">
        <Link
          aria-current={!closed ? "page" : undefined}
          className={
            !closed ? "font-semibold text-primary" : "text-muted-foreground"
          }
          href="/historial"
        >
          Activos
        </Link>
        <Link
          aria-current={closed ? "page" : undefined}
          className={
            closed ? "font-semibold text-primary" : "text-muted-foreground"
          }
          href="/historial?vista=cerrados"
        >
          Cerrados
        </Link>
      </nav>
      {!rows.length && (
        <p className="rounded-2xl border border-border bg-card p-6">
          No hay registros {closed ? "cerrados" : "activos"}.
        </p>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        {rows.map((r) => (
          <article
            key={r.id}
            className="min-w-0 space-y-4 rounded-2xl border border-border bg-card p-5"
          >
            <p className="text-xs text-muted-foreground">
              {kinds[r.kind]} · {r.date}
            </p>
            <h2 className="break-words text-lg font-semibold">
              {r.description}
            </h2>
            <p className="text-xl tabular-nums">
              {r.currency} {r.amount}
            </p>
            <p className="text-sm text-muted-foreground">
              {categories[r.kind][r.category]}
              {r.counterparty ? ` · ${r.counterparty}` : ""}
            </p>
            {r.kind !== "asset" && (
              <p className="text-sm">
                {cents(r.paid) === cents(r.amount)
                  ? "Pagada"
                  : cents(r.paid) > 0n
                    ? "Parcialmente pagada"
                    : "Abierta"}{" "}
                · Pendiente: {r.currency}{" "}
                {decimal(cents(r.amount) - cents(r.paid))}
              </p>
            )}
            {r.due_date && <p className="text-xs">Vencimiento: {r.due_date}</p>}
            {r.notes && (
              <p className="break-words text-sm text-muted-foreground">
                {r.notes}
              </p>
            )}
            {company.role !== "viewer" && (
              <>
                {!closed && (
                  <Link
                    className="inline-block text-sm text-primary"
                    href={`/inicio/agregar/manual/${r.kind}?id=${r.id}`}
                  >
                    Editar registro
                  </Link>
                )}
                <HistoryActions
                  id={r.id}
                  version={r.updated_at}
                  companyId={company.id}
                  closed={closed}
                  closable={r.kind !== "asset"}
                  deletable={
                    closed &&
                    ["receivable", "payable"].includes(r.kind) &&
                    ["owner", "admin"].includes(company.role)
                  }
                />
              </>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
