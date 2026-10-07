import Link from "next/link";
import {
  Building2,
  Check,
  MapPin,
  Monitor,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import { requireCompany } from "@/lib/context";
import { canManageCompany, analysisOptions, roleLabels } from "@/lib/constants";
import { companySchema } from "@/lib/validation";
import { SettingsForm, LocationForm } from "@/components/settings-form";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata = { title: "Configuración" };
export default async function Settings() {
  const { company, supabase, user } = await requireCompany();
  const [
    { data: locations, error: locationsError },
    { data: preferences, error: preferencesError },
  ] = await Promise.all([
    supabase
      .from("locations")
      .select("id, name")
      .eq("company_id", company.id)
      .is("archived_at", null)
      .order("created_at"),
    supabase
      .from("company_preferences")
      .select("analysis_interests")
      .eq("company_id", company.id)
      .single(),
  ]);
  if (locationsError || preferencesError)
    throw new Error("Could not load settings");
  const editable = canManageCompany(company.role);
  return (
    <div className="fade-in space-y-7">
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          A LA MEDIDA DE TU NEGOCIO
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Configuración</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Lo esencial de tu empresa, en un solo lugar.
        </p>
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6 sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <span className="rounded-xl bg-accent p-2.5 text-primary">
                <Building2 size={19} />
              </span>
              <div>
                <h2 className="text-base font-semibold">Perfil del negocio</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  La información que define tu negocio, siempre actualizada.
                </p>
              </div>
            </div>
            <SettingsForm
              key={company.id}
              companyId={company.id}
              company={companySchema.parse(company)}
              editable={editable}
            />
          </section>
          {company.has_locations && (
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <MapPin size={18} className="text-primary" />
                Sedes
              </h2>
              <p className="mb-5 mt-2 text-xs leading-6 text-muted-foreground">
                Las ubicaciones que forman parte de tu negocio.
              </p>
              {locations.length ? (
                <ul className="divide-y divide-border">
                  {locations.map((location) => (
                    <li
                      key={location.id}
                      className="flex items-center gap-3 py-3 text-sm"
                    >
                      <MapPin size={15} className="text-muted-foreground" />
                      {location.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
                  Aún no has agregado sedes. Puedes empezar por la primera.
                </p>
              )}
              {editable && <LocationForm />}
            </section>
          )}
        </div>
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Monitor size={17} className="text-primary" />
              Apariencia
            </h2>
            <p className="mb-5 mt-3 text-xs leading-6 text-muted-foreground">
              Elige lo que te resulte más cómodo. Se guarda en este navegador.
            </p>
            <ThemeToggle full />
            <p className="mt-4 text-[11px] text-muted-foreground">
              Paleta Ocean · Calma y claridad.
            </p>
          </section>
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Settings2 size={17} className="text-primary" />
              Tus intereses
            </h2>
            <p className="mt-3 text-xs leading-6 text-muted-foreground">
              Lo que elegiste conocer mejor. Estos análisis estarán disponibles
              en una próxima etapa.
            </p>
            <ul className="mt-4 space-y-3">
              {preferences.analysis_interests.map((interest) => (
                <li key={interest} className="flex items-center gap-2 text-xs">
                  <Check size={13} className="text-primary" />
                  {analysisOptions[interest as keyof typeof analysisOptions]}
                </li>
              ))}
            </ul>
            {!preferences.analysis_interests.length && (
              <p className="mt-3 text-xs text-muted-foreground">
                Puedes definir tus intereses más adelante.
              </p>
            )}
          </section>
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck size={17} className="text-primary" />
              Tu cuenta
            </h2>
            <p className="mt-4 break-all text-sm">{user.email}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {roleLabels[company.role]} en {company.name}
            </p>
            <Link
              href="/equipo"
              className="mt-5 inline-block text-xs font-medium text-primary"
            >
              Ver el equipo →
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
