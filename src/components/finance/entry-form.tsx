"use client";
import { useActionState, useState } from "react";
import { saveFinancial } from "@/app/actions/finance";
import {
  categories,
  cents,
  decimal,
  kinds,
  type Kind,
  type FinancialRecord,
} from "@/lib/finance";
import { Field, Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Help } from "@/components/ui/help";
export function EntryForm({
  kind,
  companyId,
  currency,
  today,
  locations,
  hasLocations,
  businessType,
  record,
}: {
  kind: Kind;
  companyId: string;
  currency: string;
  today: string;
  locations: { id: string; name: string }[];
  hasLocations: boolean;
  businessType: "products" | "services" | "both";
  record?: FinancialRecord;
}) {
  const [state, action, pending] = useActionState(saveFinancial, {});
  const [draft, setDraft] = useState<Record<string, string>>({});
  const change = (name: string, value: string) =>
    setDraft((previous) => ({ ...previous, [name]: value }));
  const [status, setStatus] = useState(
    record
      ? cents(record.paid) === cents(record.amount)
        ? "full"
        : cents(record.paid) > 0n
          ? "partial"
          : "pending"
      : ["receivable", "payable"].includes(kind)
        ? "pending"
        : "full",
  );
  const field = (
    name: string,
    label: string,
    type = "text",
    required = false,
    value?: string,
  ) => (
    <Field key={name} label={label} htmlFor={name}>
      <Input
        id={name}
        name={name}
        type={type}
        value={draft[name] ?? value ?? ""}
        onChange={(event) => change(name, event.target.value)}
        required={required}
        {...(type === "number"
          ? { min: 0, step: "0.01", inputMode: "decimal" as const }
          : {})}
      />
    </Field>
  );
  return (
    <form
      action={action}
      className="space-y-6 rounded-2xl border border-border bg-card p-5 sm:p-7"
    >
      <input type="hidden" name="company_id" value={companyId} />
      <input type="hidden" name="kind" value={kind} />
      <input
        type="hidden"
        name="currency"
        value={record?.currency ?? currency}
      />
      {record && (
        <>
          <input type="hidden" name="id" value={record.id} />
          <input type="hidden" name="version" value={record.updated_at} />
        </>
      )}
      <p className="text-sm text-muted-foreground">
        {kinds[kind]} · {record?.currency ?? currency}. Los campos marcados como
        opcionales pueden quedar vacíos.
      </p>
      {["receivable", "payable"].includes(kind) && (
        <p className="rounded-xl bg-accent/40 p-3 text-xs leading-6">
          Registra aquí una deuda que aún no hayas ingresado como venta o gasto.
          Los pendientes de esos movimientos ya se crean automáticamente.
        </p>
      )}
      {kind === "asset" && (
        <p className="text-xs leading-6 text-muted-foreground">
          Este activo no se cuenta como gasto del período. Si hay una deuda o
          préstamo asociado, regístralo por separado.
        </p>
      )}
      <fieldset disabled={pending} className="grid gap-5 sm:grid-cols-2">
        {field(
          "date",
          kind === "loan" ? "Fecha inicial" : "Fecha",
          "date",
          true,
          record?.date ?? today,
        )}
        {field(
          "amount",
          kind === "loan"
            ? "Monto inicial"
            : kind === "asset"
              ? "Valor de adquisición"
              : "Valor",
          "number",
          true,
          record?.amount,
        )}
        {field(
          "description",
          kind === "asset" ? "Nombre / descripción" : "Concepto",
          "text",
          true,
          record?.description,
        )}
        {kind !== "asset" &&
          field(
            "counterparty",
            ["expense", "payable"].includes(kind)
              ? "Proveedor" + (kind === "expense" ? " (opcional)" : "")
              : kind === "loan"
                ? "Entidad o persona que presta"
                : "Cliente" + (kind === "income" ? " (opcional)" : ""),
            "text",
            ["receivable", "payable", "loan"].includes(kind),
            record?.counterparty,
          )}
        <Field
          label={
            kind === "expense"
              ? "¿Para qué fue?"
              : kind === "income"
                ? "Origen"
                : "Categoría"
          }
          htmlFor="category"
        >
          <Select
            id="category"
            name="category"
            onChange={(event) => change("category", event.target.value)}
            value={
              draft.category ??
              record?.category ??
              (kind === "income" && businessType === "services"
                ? "service"
                : Object.keys(categories[kind])[0])
            }
          >
            {Object.entries(categories[kind]).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
          {kind === "expense" && (
            <Help title="¿Para qué fue?">
              Costo directo: materiales para fabricar o prestar el servicio.
              Gasto operativo: arriendo o internet para funcionar. Marketing:
              anuncios. Nómina: pagos al personal. Esto ayuda a entender en qué
              se va tu dinero.
            </Help>
          )}
        </Field>
        {hasLocations ? (
          <Field label="Sede (opcional)" htmlFor="location_id">
            <Select
              id="location_id"
              name="location_id"
              value={draft.location_id ?? record?.location_id ?? ""}
              onChange={(event) => change("location_id", event.target.value)}
            >
              <option value="">Sin sede</option>
              {locations.map((l) => (
                <option value={l.id} key={l.id}>
                  {l.name}
                </option>
              ))}
            </Select>
          </Field>
        ) : (
          <input
            type="hidden"
            name="location_id"
            value={record?.location_id ?? ""}
          />
        )}
        {!["asset", "loan"].includes(kind) && (
          <>
            <Field
              label={
                ["income", "receivable"].includes(kind)
                  ? "Estado del cobro"
                  : "Estado del pago"
              }
              htmlFor="payment_status"
            >
              <Select
                id="payment_status"
                name="payment_status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="full">
                  {["income", "receivable"].includes(kind)
                    ? "Recibido completo"
                    : "Pagado"}
                </option>
                <option value="pending">Pendiente</option>
                <option value="partial">Pago parcial</option>
              </Select>
            </Field>
            {status === "partial" &&
              field(
                "paid",
                ["income", "receivable"].includes(kind)
                  ? "Valor recibido"
                  : "Valor pagado",
                "number",
                true,
                record?.paid,
              )}
          </>
        )}
        {kind === "asset" && (
          <>
            <Field label="Forma de adquisición" htmlFor="acquisition">
              <Select
                id="acquisition"
                name="acquisition"
                value={
                  draft.acquisition ?? record?.details.acquisition ?? "cash"
                }
                onChange={(event) => change("acquisition", event.target.value)}
              >
                <option value="cash">Contado</option>
                <option value="installments">Cuotas</option>
                <option value="loan">Préstamo</option>
              </Select>
            </Field>
            {field(
              "installments",
              "Número de cuotas (opcional)",
              "number",
              false,
              record?.details.installments,
            )}
          </>
        )}
        {kind === "loan" && (
          <>
            {field(
              "balance",
              "Saldo actual",
              "number",
              true,
              record
                ? decimal(cents(record.amount) - cents(record.paid))
                : undefined,
            )}
            {field(
              "payment",
              "Cuota (opcional)",
              "number",
              false,
              record?.details.payment,
            )}
            {field(
              "rate",
              "Tasa anual % (opcional)",
              "number",
              false,
              record?.details.rate,
            )}
            {field(
              "payment_day",
              "Día de pago (opcional)",
              "number",
              false,
              record?.details.payment_day,
            )}
          </>
        )}
      </fieldset>
      <details className="rounded-xl bg-muted/50 p-4">
        <summary className="cursor-pointer text-sm font-medium">
          Más detalles (opcionales)
        </summary>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          {["income", "expense", "receivable", "payable"].includes(kind) &&
            field(
              "due_date",
              "Vencimiento (opcional)",
              "date",
              false,
              record?.due_date ?? "",
            )}
          {field(
            "reference",
            "Referencia (opcional)",
            "text",
            false,
            record?.reference,
          )}
          <Field label="Notas (opcional)" htmlFor="notes">
            <textarea
              id="notes"
              name="notes"
              maxLength={2000}
              value={draft.notes ?? record?.notes ?? ""}
              onChange={(event) => change("notes", event.target.value)}
              className="min-h-24 w-full rounded-xl border border-input bg-background p-3 text-sm"
            />
          </Field>
        </div>
      </details>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending
          ? "Guardando…"
          : record
            ? "Guardar cambios"
            : kind === "income"
              ? "Guardar ingreso"
              : kind === "expense"
                ? "Guardar gasto"
                : "Guardar registro"}
      </Button>
    </form>
  );
}
