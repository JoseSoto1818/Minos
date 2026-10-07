import { z } from "zod";
export const kinds = {
  income: "Venta / ingreso",
  expense: "Compra / gasto",
  receivable: "Dinero que te deben",
  payable: "Dinero que debes",
  asset: "Activo / inversión",
  loan: "Préstamo",
} as const;
export type Kind = keyof typeof kinds;
export const categories: Record<Kind, Record<string, string>> = {
  income: {
    product: "Venta de producto",
    service: "Servicio prestado",
    other: "Otro ingreso",
  },
  expense: {
    direct: "Para producir o prestar el servicio",
    operating: "Para hacer funcionar el negocio",
    marketing: "Marketing y ventas",
    payroll: "Nómina / personal",
    other: "Otro",
  },
  receivable: { other: "Cuenta por cobrar" },
  payable: { other: "Cuenta por pagar" },
  asset: {
    equipment: "Equipos",
    property: "Inmuebles",
    vehicle: "Vehículos",
    other: "Otro",
  },
  loan: { other: "Préstamo" },
};
export const moneySchema = z
  .string()
  .regex(
    /^\d{1,16}(\.\d{1,2})?$/,
    "Escribe un importe válido con hasta dos decimales.",
  );
export const cents = (value: string): bigint => {
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
};
export const decimal = (value: bigint): string =>
  `${value < 0n ? "-" : ""}${(value < 0n ? -value : value) / 100n}.${((value < 0n ? -value : value) % 100n).toString().padStart(2, "0")}`;
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (s) =>
      s >= "1900-01-01" &&
      s <= "2100-12-31" &&
      !Number.isNaN(Date.parse(s)) &&
      new Date(s).toISOString().slice(0, 10) === s,
    "Revisa la fecha.",
  );
export const financialSchema = z
  .object({
    kind: z.enum([
      "income",
      "expense",
      "receivable",
      "payable",
      "asset",
      "loan",
    ]),
    date: dateSchema,
    amount: moneySchema.refine(
      (v) => moneySchema.safeParse(v).success && cents(v) > 0n,
      "El valor debe ser mayor que cero.",
    ),
    paid: moneySchema,
    description: z.string().trim().min(1, "Escribe un concepto.").max(200),
    category: z.string(),
    counterparty: z.string().trim().max(200).default(""),
    location_id: z.union([z.uuid(), z.literal("")]).default(""),
    notes: z.string().max(2000).default(""),
    reference: z.string().max(200).default(""),
    due_date: z.union([dateSchema, z.literal("")]).default(""),
    details: z
      .object({
        acquisition: z.enum(["cash", "installments", "loan"]).optional(),
        installments: z.string().optional(),
        payment: z.string().optional(),
        rate: z.string().optional(),
        payment_day: z.string().optional(),
      })
      .default({}),
  })
  .superRefine((v, ctx) => {
    const issue = (message: string) =>
      ctx.addIssue({ code: "custom", message });
    if (
      !moneySchema.safeParse(v.paid).success ||
      !moneySchema.safeParse(v.amount).success
    )
      return;
    if (cents(v.paid) > cents(v.amount))
      issue("Lo pagado no puede superar el valor total.");
    if (!Object.hasOwn(categories[v.kind], v.category))
      issue("Selecciona una categoría válida.");
    if (v.due_date && v.due_date < v.date)
      issue("El vencimiento no puede ser anterior a la fecha.");
    if (["receivable", "payable", "loan"].includes(v.kind) && !v.counterparty)
      issue("Indica la persona o entidad.");
    if (v.kind === "asset" && !v.details.acquisition)
      issue("Selecciona la forma de adquisición.");
    for (const [key, max] of [
      ["installments", 1200],
      ["payment_day", 31],
    ] as const) {
      const n = v.details[key];
      if (n && (!/^\d+$/.test(n) || Number(n) < 1 || Number(n) > max))
        issue("Revisa las cuotas o el día de pago.");
    }
    if (v.details.payment && !moneySchema.safeParse(v.details.payment).success)
      issue("Revisa el valor de la cuota.");
    if (
      v.details.rate &&
      (!/^\d{1,3}(\.\d{1,2})?$/.test(v.details.rate) ||
        Number(v.details.rate) > 100)
    )
      issue("La tasa debe estar entre 0 y 100.");
  });
export type FinancialInput = z.infer<typeof financialSchema>;
export type FinancialRecord = Omit<
  FinancialInput,
  "location_id" | "due_date"
> & {
  id: string;
  company_id: string;
  currency: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  created_by: string;
  location_id: string | null;
  due_date: string | null;
};
export function todayIn(timezone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
export function periodRange(
  period: string,
  today: string,
  start?: string,
  end?: string,
) {
  const d = new Date(today + "T12:00:00Z");
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  let from = new Date(d),
    to = new Date(d);
  if (period === "custom") {
    if (
      !dateSchema.safeParse(start).success ||
      !dateSchema.safeParse(end).success ||
      start! > end!
    )
      throw new Error("Selecciona un rango válido.");
    from = new Date(start + "T12:00:00Z");
    to = new Date(end + "T12:00:00Z");
  } else if (period === "week" || period === "previous-week") {
    from.setUTCDate(
      d.getUTCDate() -
        ((d.getUTCDay() + 6) % 7) -
        (period === "previous-week" ? 7 : 0),
    );
    to = new Date(from);
    to.setUTCDate(from.getUTCDate() + 6);
  } else {
    from = new Date(
      Date.UTC(
        d.getUTCFullYear(),
        d.getUTCMonth() - (period === "previous-month" ? 1 : 0),
        1,
        12,
      ),
    );
    to = new Date(
      Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + 1, 0, 12),
    );
  }
  const days = Math.round((+to - +from) / 86400000) + 1;
  const previousEnd = new Date(+from - 86400000);
  const previousStart = ["month", "previous-month"].includes(period)
    ? new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() - 1, 1, 12))
    : new Date(+previousEnd - (days - 1) * 86400000);
  return {
    start: iso(from),
    end: iso(to),
    previousStart: iso(previousStart),
    previousEnd: iso(previousEnd),
  };
}
export function summarize(
  records: FinancialRecord[],
  start: string,
  end: string,
  currency: string,
) {
  const rows = records.filter(
    (r) => r.currency === currency && r.date >= start && r.date <= end,
  );
  const sum = (kind: Kind) =>
    rows
      .filter((r) => r.kind === kind)
      .reduce((s, r) => s + cents(r.amount), 0n);
  const income = sum("income"),
    expense = sum("expense");
  const balance = (ks: Kind[]) =>
    records
      .filter(
        (r) => r.currency === currency && r.date <= end && ks.includes(r.kind),
      )
      .reduce((s, r) => s + cents(r.amount) - cents(r.paid), 0n);
  return {
    income,
    expense,
    result: income - expense,
    receivable: balance(["income", "receivable"]),
    payable: balance(["expense", "payable"]),
    rows,
  };
}
