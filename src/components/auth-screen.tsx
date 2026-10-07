import { ArrowUpRight, Check, ShieldCheck, Sprout } from "lucide-react";
import { Brand } from "./brand";
import { ThemeToggle } from "./theme-toggle";
import { AuthForm } from "./auth-form";
import { getSupabaseConfig } from "@/lib/supabase/config";

export function AuthScreen({
  mode,
  confirmationError = false,
}: {
  mode: "login" | "signup";
  confirmationError?: boolean;
}) {
  const signup = mode === "signup";
  return (
    <main className="grid min-h-svh lg:grid-cols-[1fr_1fr]">
      <section className="ocean-art relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col xl:p-16">
        <div className="ocean-lines pointer-events-none absolute inset-0" />
        <div className="relative">
          <Brand light />
        </div>
        <div className="relative my-auto max-w-lg py-20">
          <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3.5 py-2 text-xs tracking-wide text-white/85">
            <span className="size-1.5 rounded-full bg-teal-300" />
            MENOS RUIDO. MÁS CLARIDAD.
          </span>
          <h2 className="text-5xl leading-[1.12] font-medium tracking-[-2px] xl:text-6xl">
            Tu negocio.
            <br />
            Tus decisiones.
            <br />
            <span className="text-[#94dbe0]">Un camino más claro.</span>
          </h2>
          <p className="mt-7 max-w-sm text-base leading-7 text-white/70">
            Un espacio para entender tus números y cuidar lo que estás
            construyendo.
          </p>
          <div className="relative mt-12 max-w-[340px] rounded-2xl border border-white/15 bg-white/[0.07] p-5 backdrop-blur-sm">
            <div className="mb-6 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm">
                <Sprout size={18} className="text-[#94dbe0]" />
                Hecho para tu negocio
              </span>
              <ArrowUpRight size={18} className="text-white/50" />
            </div>
            <div className="space-y-4">
              {[
                "Empieza con lo que sabes",
                "Avanza a tu propio ritmo",
                "Ten tus datos en un solo lugar",
              ].map((text) => (
                <div
                  key={text}
                  className="flex items-center gap-3 text-sm text-white/80"
                >
                  <span className="flex size-5 items-center justify-center rounded-full bg-teal-300/15 text-teal-200">
                    <Check size={12} />
                  </span>
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="relative text-xs text-white/45">
          Para quienes construyen empresa, todos los días.
        </p>
      </section>
      <section className="flex min-w-0 flex-col bg-card px-6 py-7 sm:px-12 lg:px-14">
        <div className="flex items-center justify-between lg:justify-end">
          <div className="lg:hidden">
            <Brand />
          </div>
          <ThemeToggle />
        </div>
        <div className="mx-auto flex w-full max-w-[390px] flex-1 flex-col justify-center py-16">
          <div className="fade-in">
            <span className="mb-5 inline-flex size-11 items-center justify-center rounded-2xl border border-primary/15 bg-accent text-primary">
              <Sprout size={22} />
            </span>
            <p className="mb-2 text-xs font-semibold tracking-[.15em] text-primary">
              {signup ? "UN NUEVO COMIENZO" : "TU ESPACIO DE CLARIDAD"}
            </p>
            <h1 className="text-[32px] leading-tight font-semibold tracking-[-1px]">
              {signup
                ? "Grandes pasos. Un inicio simple."
                : "Qué bueno verte de nuevo."}
            </h1>
            <p className="mb-8 mt-3 text-sm leading-6 text-muted-foreground">
              {signup
                ? "Crea tu cuenta y empecemos a conocer tu negocio. Solo necesitas tu correo y una contraseña."
                : "Entra y sigue construyendo el futuro de tu negocio."}
            </p>
            {confirmationError && (
              <p
                role="alert"
                className="mb-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
              >
                El enlace ya no es válido. Si ya confirmaste tu correo, inicia
                sesión. De lo contrario, vuelve a registrarte para solicitar
                otro enlace.
              </p>
            )}
            <AuthForm mode={mode} configured={!!getSupabaseConfig()} />
          </div>
        </div>
        <div className="flex justify-center gap-2 pb-3 text-xs text-muted-foreground">
          <ShieldCheck size={15} />
          <span>Tu información, en tu espacio.</span>
        </div>
      </section>
    </main>
  );
}
