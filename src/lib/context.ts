import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { getSupabaseConfig } from "./supabase/config";

export const requireUser = cache(async () => {
  if (!getSupabaseConfig()) redirect("/iniciar-sesion");
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) redirect("/iniciar-sesion");
  return { user, supabase };
});

export const getUserCompanies = cache(async () => {
  const { user, supabase } = await requireUser();
  const { data: memberships, error } = await supabase
    .from("company_memberships")
    .select("company_id, role")
    .eq("user_id", user.id);
  if (error) throw new Error("Could not load memberships", { cause: error });
  if (!memberships.length) return [];
  const { data: companies, error: companyError } = await supabase
    .from("companies")
    .select("*")
    .in(
      "id",
      memberships.map((m) => m.company_id),
    )
    .order("created_at");
  if (companyError)
    throw new Error("Could not load companies", { cause: companyError });
  return companies.map((company) => ({
    ...company,
    role: memberships.find((m) => m.company_id === company.id)!.role,
  }));
});

export const requireCompany = cache(async () => {
  const { user, supabase } = await requireUser();
  const companies = await getUserCompanies();
  if (!companies.length) redirect("/onboarding");
  const selected = (await cookies()).get("minos-company")?.value;
  const company = companies.find((c) => c.id === selected) ?? companies[0];
  return { user, supabase, company, companies };
});

export async function setCompanyCookie(companyId: string) {
  (await cookies()).set("minos-company", companyId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
