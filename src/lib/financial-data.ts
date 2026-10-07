import "server-only";
import { requireCompany } from "./context";
import type { FinancialRecord } from "./finance";
export async function financialContext() {
  const context = await requireCompany();
  const { data, error } = await context.supabase.rpc("list_financial", {
    target: context.company.id,
  });
  if (error) throw new Error("No pudimos consultar tus registros.");
  return { ...context, records: data as unknown as FinancialRecord[] };
}
