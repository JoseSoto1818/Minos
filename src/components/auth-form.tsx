"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  Mail,
  CheckCircle2,
} from "lucide-react";
import { authenticate } from "@/app/actions/auth";
import { Button } from "./ui/button";
import { Field, Input } from "./ui/field";

export function AuthForm({
  mode,
  configured,
}: {
  mode: "login" | "signup";
  configured: boolean;
}) {
  const [state, action, pending] = useActionState(
    authenticate.bind(null, mode),
    {},
  );
  const [showPassword, setShowPassword] = useState(false);
  const signup = mode === "signup";
  if (state.success)
    return (
      <div className="space-y-5 rounded-2xl border border-border bg-accent/40 p-6">
        <CheckCircle2 className="text-primary" />
        <h2 className="text-xl font-semibold">Un último paso en tu correo</h2>
        <p role="status" className="text-sm leading-6 text-muted-foreground">
          {state.success}
        </p>
        <Link
          href="/iniciar-sesion"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary"
        >
          Ir a iniciar sesión <ArrowRight size={16} />
        </Link>
      </div>
    );
  return (
    <form action={action} className="space-y-5">
      {!configured && (
        <p
          role="status"
          className="rounded-xl border border-primary/20 bg-accent p-4 text-sm leading-6 text-accent-foreground"
        >
          Estamos preparando tu espacio. El registro y el acceso estarán
          disponibles cuando termine la configuración.
        </p>
      )}
      <Field label="Correo electrónico" htmlFor="email">
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-3.5 top-4 text-muted-foreground"
            size={16}
          />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="tu@negocio.com"
            required
            maxLength={254}
            className="pl-10"
            disabled={pending}
          />
        </div>
      </Field>
      <Field
        label="Contraseña"
        htmlFor="password"
        hint={
          signup
            ? "Usa al menos 10 caracteres. Una frase que recuerdes funciona muy bien."
            : undefined
        }
      >
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete={signup ? "new-password" : "current-password"}
            minLength={signup ? 10 : 1}
            maxLength={128}
            placeholder={
              signup ? "Crea una contraseña segura" : "Escribe tu contraseña"
            }
            required
            disabled={pending}
            className="pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
            aria-pressed={showPassword}
            className="absolute right-1 top-1 flex size-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </Field>
      {state.error && (
        <p
          role="alert"
          className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
        >
          {state.error}
        </p>
      )}
      <Button
        type="submit"
        className="w-full"
        disabled={pending || !configured}
      >
        {pending ? (
          <>
            <LoaderCircle className="animate-spin" />
            Un momento…
          </>
        ) : (
          <>
            {signup ? "Crear mi cuenta" : "Entrar a mi negocio"}
            <ArrowRight />
          </>
        )}
      </Button>
      <p className="pt-3 text-center text-sm text-muted-foreground">
        {signup ? "¿Ya tienes una cuenta?" : "¿Es tu primera vez aquí?"}{" "}
        <Link
          className="font-medium text-primary hover:underline"
          href={signup ? "/iniciar-sesion" : "/registro"}
        >
          {signup ? "Inicia sesión" : "Crea tu cuenta"}
        </Link>
      </p>
    </form>
  );
}
