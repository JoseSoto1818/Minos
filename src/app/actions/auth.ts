"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { loginSchema, signupSchema, type ActionState } from "@/lib/validation";

export async function authenticate(
  mode: "login" | "signup",
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!getSupabaseConfig())
    return {
      error:
        "Estamos preparando el acceso a Minos. Inténtalo cuando termine la configuración.",
    };
  const parsed = (mode === "signup" ? signupSchema : loginSchema).safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const supabase = await createClient();
  if (mode === "login") {
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error)
      return {
        error:
          error.code === "email_not_confirmed"
            ? "Confirma tu correo antes de entrar. Revisa también la carpeta de spam."
            : "No pudimos iniciar sesión. Revisa tu correo y contraseña e inténtalo de nuevo.",
      };
  } else {
    const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const { data, error } = await supabase.auth.signUp({
      ...parsed.data,
      options: { emailRedirectTo: `${site}/auth/confirm` },
    });
    if (error)
      return {
        error:
          error.status === 429
            ? "Has hecho varios intentos. Espera unos minutos antes de volver a intentar."
            : "No pudimos crear tu cuenta. Revisa los datos o intenta iniciar sesión si ya tienes una.",
      };
    if (!data.session)
      return {
        success:
          "Revisa tu correo. Si puedes registrarte con esa dirección, recibirás un enlace para confirmar tu cuenta.",
      };
  }
  redirect("/");
}

export async function signOut() {
  if (getSupabaseConfig()) {
    const supabase = await createClient();
    await supabase.auth.signOut({ scope: "local" });
  }
  (await cookies()).delete("minos-company");
  redirect("/iniciar-sesion");
}
