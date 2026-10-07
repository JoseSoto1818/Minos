"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireCompany } from "@/lib/context";
import { financialSchema, cents, decimal, moneySchema } from "@/lib/finance";
import type { ActionState } from "@/lib/validation";
export async function saveFinancial(
  _state: ActionState,
  form: FormData,
): Promise<ActionState> {
  const { company, supabase } = await requireCompany();
  if (company.role === "viewer" || form.get("company_id") !== company.id)
    return {
      error: "No tienes permiso o cambió la empresa activa. Recarga la página.",
    };
  const raw = Object.fromEntries(form);
  if (!raw.id && raw.currency !== company.base_currency)
    return {
      error:
        "La moneda de tu empresa cambió. Recarga la página antes de guardar.",
    };
  const amount = String(raw.amount ?? "");
  let paid = String(raw.paid ?? "0");
  if (!moneySchema.safeParse(amount).success)
    return { error: "Revisa el valor del registro." };
  if (raw.kind === "loan") {
    const balance = String(raw.balance ?? "");
    if (
      !moneySchema.safeParse(balance).success ||
      cents(balance) > cents(amount)
    )
      return { error: "El saldo debe estar entre cero y el monto inicial." };
    paid = decimal(cents(amount) - cents(balance));
  } else if (raw.kind === "asset")
    paid = raw.acquisition === "cash" ? amount : "0";
  else if (raw.payment_status === "full") paid = amount;
  else if (raw.payment_status === "pending") paid = "0";
  else if (raw.payment_status !== "partial")
    return { error: "Selecciona el estado del pago." };
  if (
    raw.payment_status === "partial" &&
    (!moneySchema.safeParse(paid).success ||
      cents(paid) <= 0n ||
      cents(paid) >= cents(amount))
  )
    return {
      error: "El pago parcial debe ser mayor que cero y menor que el total.",
    };
  const parsed = financialSchema.safeParse({
    ...raw,
    paid,
    details: {
      acquisition: raw.acquisition || undefined,
      installments: raw.installments || undefined,
      payment: raw.payment || undefined,
      rate: raw.rate || undefined,
      payment_day: raw.payment_day || undefined,
    },
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const id = String(raw.id ?? "");
  if (id && !z.uuid().safeParse(id).success)
    return { error: "Registro inválido." };
  const { data: recordId, error } = await supabase.rpc("save_financial", {
    target: company.id,
    payload: { ...parsed.data, currency: String(raw.currency) },
    ...(id ? { record_id: id, expected_version: String(raw.version) } : {}),
  });
  if (error)
    return {
      error:
        error.code === "40001"
          ? "El registro cambió. Recarga antes de editar."
          : "No se pudo guardar. Revisa los campos e inténtalo de nuevo.",
    };
  revalidatePath("/", "layout");
  const { data: saved } = await supabase
    .from("financial_transactions")
    .select("closed_at")
    .eq("id", recordId!)
    .eq("company_id", company.id)
    .single();
  redirect(
    `/historial?guardado=1&vista=${saved?.closed_at ? "cerrados" : "activos"}`,
  );
}
export async function changeFinancial(
  _state: ActionState,
  form: FormData,
): Promise<ActionState> {
  const { company, supabase } = await requireCompany();
  if (company.role === "viewer" || form.get("company_id") !== company.id)
    return { error: "No tienes permiso o cambió la empresa activa." };
  const parsed = z
    .object({
      id: z.uuid(),
      version: z.iso.datetime({ offset: true }),
      operation: z.enum(["close", "restore", "delete"]),
      confirmation: z.string().optional(),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Solicitud inválida." };
  if (
    parsed.data.operation === "delete" &&
    (form.get("confirm_delete") !== "on" ||
      parsed.data.confirmation !== "ELIMINAR")
  )
    return { error: "Confirma ambas verificaciones para eliminar." };
  const { error } = await supabase.rpc("change_financial", {
    target: company.id,
    record_id: parsed.data.id,
    expected_version: parsed.data.version,
    operation: parsed.data.operation,
    confirmation: parsed.data.confirmation,
  });
  if (error)
    return {
      error:
        "No se pudo actualizar. Revisa tus permisos y recarga si el registro cambió.",
    };
  revalidatePath("/", "layout");
  return { success: "Registro actualizado." };
}
