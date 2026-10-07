import Link from "next/link";
import {
  categories,
  cents,
  decimal,
  periodRange,
  summarize,
  todayIn,
  type FinancialRecord,
} from "@/lib/finance";
import { Help } from "@/components/ui/help";
import { PeriodFilter } from "./period-filter";
function percent(a: bigint, b: bigint) {
  return b === 0n ? null : decimal((a * 10000n) / b) + "%";
}
export function Dashboard({
  records,
  company,
  query,
}: {
  records: FinancialRecord[];
  company: { name: string; base_currency: string; timezone: string };
  query: Record<string, string | undefined>;
}) {
  const currencies = [
    ...new Set([company.base_currency, ...records.map((r) => r.currency)]),
  ];
  const currency = currencies.includes(query.currency ?? "")
    ? query.currency!
    : company.base_currency;
  const period = [
    "week",
    "previous-week",
    "month",
    "previous-month",
    "custom",
  ].includes(query.period ?? "")
    ? query.period!
    : "month";
  let range;
  let error = "";
  try {
    range = periodRange(
      period,
      todayIn(company.timezone),
      query.start,
      query.end,
    );
  } catch {
    error =
      "Selecciona un rango válido: la fecha inicial debe ser anterior o igual a la final.";
    range = periodRange("month", todayIn(company.timezone));
  }
  const current = summarize(records, range.start, range.end, currency);
  const previous = summarize(
    records,
    range.previousStart,
    range.previousEnd,
    currency,
  );
  const comparable = previous.rows.some((r) =>
    ["income", "expense"].includes(r.kind),
  );
  const money = (v: bigint) => `${currency} ${decimal(v)}`;
  const group = (kind: string, by: "date" | "category") => {
    const values = new Map<string, bigint>();
    for (const r of current.rows.filter((r) => r.kind === kind)) {
      const key = by === "date" ? r.date : categories[r.kind][r.category];
      values.set(key, (values.get(key) ?? 0n) + cents(r.amount));
    }
    return [...values.entries()].sort(([a], [b]) => a.localeCompare(b));
  };
  const chart = (title: string, items: [string, bigint][]) => {
    const max = items.reduce((m, [, v]) => (v > m ? v : m), 0n);
    return (
      <section className="min-w-0 rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-5 font-semibold">{title}</h2>
        {!items.length ? (
          <p className="text-sm text-muted-foreground">
            Sin registros en este período.
          </p>
        ) : (
          <ul className="max-h-80 space-y-4 overflow-y-auto">
            {items.map(([label, value]) => (
              <li key={label}>
                <div className="mb-2 flex flex-wrap justify-between gap-2 text-xs">
                  <span>{label}</span>
                  <span className="tabular-nums">{money(value)}</span>
                </div>
                <div aria-hidden="true" className="h-3 rounded-full bg-muted">
                  <div
                    className="h-3 rounded-full bg-primary"
                    style={{
                      width: `${max ? Number((value * 10000n) / max) / 100 : 0}%`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{company.name}</p>
          <h1 className="mt-1 text-3xl font-semibold">
            Tu negocio, en números
          </h1>
        </div>
        <Link
          className="rounded-xl bg-primary px-5 py-3 text-sm text-primary-foreground"
          href="/inicio/agregar/manual"
        >
          Agregar mis números
        </Link>
      </div>
      <Link className="inline-block text-sm text-primary" href="/historial">
        Ver historial →
      </Link>
      <PeriodFilter
        key={`${period}:${currency}:${range.start}:${range.end}`}
        period={period}
        currency={currency}
        currencies={currencies}
        start={query.start ?? range.start}
        end={query.end ?? range.end}
      />

      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        {range.start} — {range.end} · Fechas según {company.timezone}. Las
        monedas se muestran por separado.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          [
            "Ventas / ingresos",
            money(current.income),
            current.income,
            previous.income,
          ],
          [
            "Resultado estimado",
            money(current.result),
            current.result,
            previous.result,
          ],
          [
            "Margen",
            percent(current.result, current.income) ?? "Sin ingresos",
            null,
            null,
          ],
          ["Cuentas por cobrar", money(current.receivable), null, null],
          ["Cuentas por pagar", money(current.payable), null, null],
        ].map(([label, value, a, b]) => (
          <section
            key={String(label)}
            className="min-w-0 rounded-2xl border border-border bg-card p-5"
          >
            <h2 className="text-xs text-muted-foreground">{String(label)}</h2>
            <p className="mt-3 break-words text-xl font-semibold tabular-nums">
              {String(value)}
            </p>
            {typeof a === "bigint" && typeof b === "bigint" && (
              <p className="mt-3 text-xs text-muted-foreground">
                {!comparable
                  ? "Sin período anterior"
                  : b === 0n
                    ? "Período anterior en cero"
                    : `${percent(a - b, b < 0n ? -b : b)} vs. período anterior`}
              </p>
            )}
          </section>
        ))}
      </div>
      <div className="flex items-start gap-2 text-xs leading-6 text-muted-foreground">
        <Help title="Cómo leer tus números">
          Resultado estimado = ingresos registrados menos compras y gastos
          registrados, estén pagados o pendientes. Margen = resultado dividido
          entre ingresos. Activos, préstamos y cuentas ingresadas por separado
          no se suman como ventas o gastos. No es utilidad contable ni incluye
          depreciación o impuestos calculados.
        </Help>
        <p>
          Resultado según los registros del período. Cuentas pendientes
          acumuladas hasta {range.end}, con el saldo actualizado hoy.
          Comparación: {range.previousStart} — {range.previousEnd}.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {chart("Ingresos por tiempo", group("income", "date"))}
        {chart("Gastos por categoría", group("expense", "category"))}
        {chart("Desglose de ingresos", group("income", "category"))}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Cuentas pendientes</h2>
          <p className="mt-4 text-sm">
            Por cobrar: {money(current.receivable)}
          </p>
          <p className="mt-3 text-sm">Por pagar: {money(current.payable)}</p>
          <Link
            className="mt-5 inline-block text-sm text-primary"
            href="/historial"
          >
            Consultar cuentas y movimientos →
          </Link>
          <p className="mt-4 text-xs leading-6 text-muted-foreground">
            Los pendientes de ventas y gastos se cuentan una sola vez. Las
            cuentas manuales representan deudas que aún no registraste como
            movimientos.
          </p>
        </section>
      </div>
    </div>
  );
}
