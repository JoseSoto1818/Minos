import { ShieldCheck, Users } from "lucide-react";
import { requireCompany } from "@/lib/context";
import { roleLabels } from "@/lib/constants";
import { initials } from "@/lib/utils";

export const metadata = { title: "Equipo" };
export default async function Team() {
  const { supabase, company, user } = await requireCompany();
  const { data: members, error } = await supabase
    .from("company_memberships")
    .select("user_id, role")
    .eq("company_id", company.id)
    .order("created_at");
  if (error) throw new Error("Could not load team");
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, display_name")
    .in(
      "id",
      members.map((m) => m.user_id),
    );
  if (profileError) throw new Error("Could not load profiles");
  return (
    <div className="fade-in space-y-7">
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          JUNTOS, CON MÁS CLARIDAD
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Tu equipo</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Las personas que tienen acceso a {company.name}.
        </p>
      </div>
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border p-6">
          <Users size={20} className="text-primary" />
          <h2 className="text-base font-medium">Miembros del negocio</h2>
          <span className="rounded-full bg-muted px-2 py-1 text-xs tabular-nums">
            {members.length}
          </span>
        </div>
        <ul className="divide-y divide-border px-6">
          {members.map((member) => {
            const profile = profiles.find((p) => p.id === member.user_id);
            const name =
              profile?.display_name || profile?.email || "Miembro del equipo";
            return (
              <li
                key={member.user_id}
                className="flex flex-wrap items-center gap-3 py-5"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-medium text-primary">
                  {initials(name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="break-all text-sm font-medium">
                    {name}{" "}
                    {member.user_id === user.id && (
                      <span className="font-normal text-muted-foreground">
                        (tú)
                      </span>
                    )}
                  </p>
                  {profile?.display_name && (
                    <p className="mt-1 break-all text-xs text-muted-foreground">
                      {profile.email}
                    </p>
                  )}
                </div>
                <span className="rounded-full bg-muted px-3 py-1.5 text-xs">
                  {roleLabels[member.role]}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            role: "Propietario",
            text: "Gestiona la empresa y tiene todos los permisos.",
          },
          {
            role: "Administrador",
            text: "Gestiona la operación y la configuración de la empresa.",
          },
          {
            role: "Contador",
            text: "Consulta el negocio. Podrá gestionar datos financieros cuando estén disponibles.",
          },
          {
            role: "Solo lectura",
            text: "Consulta la información sin modificarla.",
          },
        ].map((role) => (
          <section
            key={role.role}
            className="rounded-xl border border-border bg-card p-5"
          >
            <ShieldCheck size={17} className="mb-3 text-primary" />
            <h2 className="text-sm font-medium">{role.role}</h2>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              {role.text}
            </p>
          </section>
        ))}
      </div>
      <p className="rounded-xl border border-border bg-muted/40 p-4 text-xs leading-6 text-muted-foreground">
        Las invitaciones y la gestión de roles desde Minos estarán disponibles
        más adelante. Por ahora puedes consultar quién tiene acceso a tu
        empresa.
      </p>
    </div>
  );
}
