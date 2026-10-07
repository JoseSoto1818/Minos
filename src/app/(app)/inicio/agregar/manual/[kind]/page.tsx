import Link from "next/link";
import { notFound } from "next/navigation";
import { financialContext } from "@/lib/financial-data";
import { kinds, todayIn, type Kind } from "@/lib/finance";
import { EntryForm } from "@/components/finance/entry-form";
export default async function Entry({
  params,
  searchParams,
}: {
  params: Promise<{ kind: string }>;
  searchParams: Promise<{ id?: string }>;
}) {
  const { kind } = await params;
  const { id } = await searchParams;
  if (!Object.hasOwn(kinds, kind)) notFound();
  const { company, supabase, records } = await financialContext();
  const record = id
    ? records.find((r) => r.id === id && r.kind === kind)
    : undefined;
  if (id && !record) notFound();
  const { data: locations, error } = await supabase
    .from("locations")
    .select("id,name")
    .eq("company_id", company.id)
    .is("archived_at", null);
  if (error) throw new Error("No pudimos consultar las sedes.");
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        className="text-sm text-primary"
        href={id ? "/historial" : "/inicio/agregar/manual"}
      >
        ← Volver
      </Link>
      <h1 className="text-2xl font-semibold">
        {record ? "Editar: " : ""}
        {kinds[kind as Kind]}
      </h1>
      {company.role === "viewer" ? (
        <p>
          Tu permiso es de consulta. Pide a un administrador que registre la
          información.
        </p>
      ) : record?.closed_at ? (
        <p>Restaura el registro desde el historial antes de editarlo.</p>
      ) : (
        <EntryForm
          kind={kind as Kind}
          companyId={company.id}
          currency={company.base_currency}
          today={todayIn(company.timezone)}
          hasLocations={company.has_locations}
          businessType={company.business_type}
          locations={locations ?? []}
          record={record}
        />
      )}
    </div>
  );
}
