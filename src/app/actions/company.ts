"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  requireCompany,
  requireUser,
  getUserCompanies,
  setCompanyCookie,
} from "@/lib/context";
import { canManageCompany } from "@/lib/constants";
import {
  companySchema,
  onboardingSchema,
  type ActionState,
} from "@/lib/validation";

export async function createCompany(
  _state: ActionState,
  form: FormData,
): Promise<ActionState> {
  const { supabase } = await requireUser();
  const parsed = onboardingSchema.safeParse({
    ...Object.fromEntries(form),
    has_locations: form.get("has_locations") === "true",
    locations: form.getAll("locations"),
    interests: form.getAll("interests"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const c = parsed.data;
  const { data, error } = await supabase.rpc("create_company", {
    company_name: c.name,
    country: c.country_code,
    currency: c.base_currency,
    company_timezone: c.timezone,
    company_industry: c.industry,
    kind: c.business_type,
    multiple_locations: c.has_locations,
    location_names: c.locations,
    interests: c.interests,
  });
  if (error || !data) {
    console.error("Company creation failed", { code: error?.code });
    return {
      error:
        "No pudimos guardar tu negocio. Revisa los nombres de las sedes e inténtalo de nuevo.",
    };
  }
  await setCompanyCookie(data);
  revalidatePath("/", "layout");
  redirect("/inicio");
}

export async function switchCompany(form: FormData) {
  const id = z.uuid().safeParse(form.get("company_id"));
  const companies = await getUserCompanies();
  if (id.success && companies.some((c) => c.id === id.data))
    await setCompanyCookie(id.data);
  revalidatePath("/", "layout");
  redirect("/inicio");
}

export async function updateCompany(
  _state: ActionState,
  form: FormData,
): Promise<ActionState> {
  const { supabase, company } = await requireCompany();
  if (!canManageCompany(company.role))
    return {
      error: "Solo el propietario o un administrador pueden editar el negocio.",
    };
  const parsed = companySchema.safeParse({
    ...Object.fromEntries(form),
    has_locations: form.get("has_locations") === "true",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { data, error } = await supabase
    .from("companies")
    .update(parsed.data)
    .eq("id", company.id)
    .select("id");
  if (error || !data?.length)
    return { error: "No pudimos guardar los cambios. Inténtalo de nuevo." };
  revalidatePath("/", "layout");
  return { success: "Los datos de tu negocio se guardaron." };
}

export async function addLocation(
  _state: ActionState,
  form: FormData,
): Promise<ActionState> {
  const { supabase, company, user } = await requireCompany();
  if (!canManageCompany(company.role) || !company.has_locations)
    return { error: "No tienes permiso para agregar sedes en este negocio." };
  const name = z.string().trim().min(1).max(100).safeParse(form.get("name"));
  if (!name.success)
    return { error: "Escribe un nombre de hasta 100 caracteres." };
  const { error } = await supabase
    .from("locations")
    .insert({ company_id: company.id, name: name.data, created_by: user.id });
  if (error)
    return {
      error:
        error.code === "23505"
          ? "Ya tienes una sede con ese nombre."
          : "No pudimos agregar la sede. Inténtalo de nuevo.",
    };
  revalidatePath("/configuracion");
  return { success: "Sede agregada." };
}
