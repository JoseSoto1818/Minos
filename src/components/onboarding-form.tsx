"use client";
import { useActionState, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  CheckCheck,
  Globe2,
  LoaderCircle,
  MapPin,
  Package,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { createCompany } from "@/app/actions/company";
import {
  countries,
  currencies,
  industries,
  businessTypes,
  analysisOptions,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Field, Input, Select } from "./ui/field";
import { Help } from "./ui/help";

export function OnboardingForm() {
  const [step, setStep] = useState(0);
  const [state, action, pending] = useActionState(createCompany, {});
  const [country, setCountry] = useState("CO");
  const [currency, setCurrency] = useState("COP");
  const [timezone, setTimezone] = useState("America/Bogota");
  const [kind, setKind] = useState<keyof typeof businessTypes>("services");
  const [hasLocations, setHasLocations] = useState(false);
  const [locations, setLocations] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([
    "sales",
    "expenses",
    "cash",
  ]);
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [validationError, setValidationError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  function next() {
    const fields = formRef.current?.querySelectorAll<
      HTMLInputElement | HTMLSelectElement
    >(`[data-step="${step}"] input, [data-step="${step}"] select`);
    if (fields && [...fields].some((field) => !field.reportValidity())) return;
    if (step === 0 && name.trim().length < 2) {
      setValidationError(
        "Escribe el nombre de tu negocio (mínimo 2 caracteres).",
      );
      return;
    }
    if (
      step === 1 &&
      new Set(locations.map((s) => s.trim().toLowerCase())).size !==
        locations.length
    ) {
      setValidationError("Usa un nombre diferente para cada sede.");
      return;
    }
    setValidationError("");
    setStep(step + 1);
  }
  return (
    <div className="mx-auto w-full max-w-[640px] pb-12">
      <ol
        className="mb-10 flex items-center justify-center gap-2 sm:gap-5"
        aria-label="Progreso de configuración"
      >
        {["Tu negocio", "Su estructura", "Tu espacio"].map((label, index) => (
          <li
            key={label}
            className={cn(
              "flex items-center gap-2 text-xs sm:text-sm",
              step === index
                ? "font-medium text-foreground"
                : "text-muted-foreground",
            )}
            aria-current={step === index ? "step" : undefined}
          >
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-full border text-xs",
                index <= step
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border",
              )}
            >
              {index < step ? <Check size={14} /> : index + 1}
            </span>
            <span>{label}</span>
            {index < 2 && (
              <span className="ml-1 hidden h-px w-6 bg-border sm:block" />
            )}
          </li>
        ))}
      </ol>
      <div className="mb-7 text-center">
        <p className="mb-2 text-xs font-semibold tracking-[.14em] text-primary">
          HAGAMOS ESPACIO PARA TU NEGOCIO
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {
            [
              "Empecemos por lo esencial.",
              "Cada negocio tiene su forma.",
              "Un espacio a tu medida.",
            ][step]
          }
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          {
            [
              "Cuéntanos un poco sobre tu empresa. Podrás ajustar estos datos después.",
              "Minos se adapta a ti. Agrega solo lo que tenga sentido para tu negocio.",
              "Elige qué te gustaría entender mejor. No necesitas tener todos tus datos todavía.",
            ][step]
          }
        </p>
      </div>
      <form
        ref={formRef}
        action={action}
        onKeyDown={(e) => {
          if (
            e.key === "Enter" &&
            step < 2 &&
            e.target instanceof HTMLInputElement
          ) {
            e.preventDefault();
            next();
          }
        }}
        className="rounded-2xl border border-border bg-card p-6 sm:p-8"
      >
        <input type="hidden" name="timezone" value={timezone} />
        <input type="hidden" name="business_type" value={kind} />
        <input
          type="hidden"
          name="has_locations"
          value={String(hasLocations)}
        />
        <div data-step="0" hidden={step !== 0} className="space-y-5">
          <Field label="¿Cómo se llama tu negocio?" htmlFor="name">
            <Input
              id="name"
              name="name"
              placeholder="El nombre que estás construyendo"
              required
              minLength={2}
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="País" htmlFor="country">
              <Select
                id="country"
                name="country_code"
                value={country}
                onChange={(e) => {
                  const c = countries.find((v) => v.code === e.target.value)!;
                  setCountry(c.code);
                  setCurrency(c.currency);
                  setTimezone(c.timezone);
                }}
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Moneda principal" htmlFor="currency">
              <Select
                id="currency"
                name="base_currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="flex items-start gap-2 rounded-xl bg-muted/60 px-4 py-3 text-xs leading-5 text-muted-foreground">
            <Globe2 size={15} className="mt-0.5 shrink-0" />
            <p>
              Usaremos la hora de {timezone.replaceAll("_", " ")}. Puedes
              cambiarla en Configuración.
            </p>
            <Help title="Moneda principal">
              Es la moneda en la que verás los números de tu negocio. Minos no
              inventa tipos de cambio.
            </Help>
          </div>
          <Field label="¿En qué sector trabajas?" htmlFor="industry">
            <Select
              id="industry"
              name="industry"
              value={industry}
              required
              onChange={(e) => setIndustry(e.target.value)}
            >
              <option value="" disabled>
                Selecciona un sector
              </option>
              {industries.map((i) => (
                <option key={i}>{i}</option>
              ))}
            </Select>
          </Field>
        </div>
        <div data-step="1" hidden={step !== 1} className="space-y-7">
          <fieldset>
            <legend className="mb-3 text-sm font-medium">
              ¿Qué ofrece tu negocio?
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(businessTypes).map(([value, label]) => {
                const Icon =
                  value === "products"
                    ? Package
                    : value === "services"
                      ? BriefcaseBusiness
                      : Sparkles;
                return (
                  <label
                    key={value}
                    className={cn(
                      "relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border p-4 text-center text-xs transition sm:text-sm",
                      kind === value
                        ? "border-primary bg-accent text-accent-foreground"
                        : "border-border hover:bg-muted",
                    )}
                  >
                    <input
                      className="sr-only peer"
                      type="radio"
                      name="kind-ui"
                      checked={kind === value}
                      onChange={() =>
                        setKind(value as keyof typeof businessTypes)
                      }
                    />
                    <span className="absolute inset-0 rounded-xl peer-focus-visible:ring-4 peer-focus-visible:ring-primary/30" />
                    <Icon size={23} />
                    {label}
                  </label>
                );
              })}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-3 text-sm font-medium">
              ¿Tienes más de una sede?
            </legend>
            <div className="flex gap-3">
              {[
                { value: false, label: "No, por ahora" },
                { value: true, label: "Sí, tengo varias" },
              ].map((option) => (
                <label
                  key={option.label}
                  className={cn(
                    "flex flex-1 cursor-pointer items-center gap-2 rounded-xl border px-3 py-3 text-sm",
                    hasLocations === option.value && "border-primary bg-accent",
                  )}
                >
                  <input
                    type="radio"
                    name="locations-ui"
                    checked={hasLocations === option.value}
                    onChange={() => {
                      setHasLocations(option.value);
                      if (!option.value) setLocations([]);
                    }}
                    className="accent-primary"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
          {hasLocations && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Agrega las sedes que quieras. También puedes hacerlo después.
              </p>
              {locations.map((location, i) => (
                <div key={i} className="flex items-center gap-2">
                  <MapPin
                    size={17}
                    className="shrink-0 text-muted-foreground"
                  />
                  <Input
                    name="locations"
                    aria-label={`Nombre de sede ${i + 1}`}
                    placeholder={`Nombre de sede ${i + 1}`}
                    value={location}
                    required
                    maxLength={100}
                    onChange={(e) =>
                      setLocations(
                        locations.map((s, j) => (j === i ? e.target.value : s)),
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Quitar sede ${i + 1}`}
                    onClick={() =>
                      setLocations(locations.filter((_, j) => j !== i))
                    }
                  >
                    <X />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                type="button"
                size="sm"
                disabled={locations.length >= 10}
                onClick={() => setLocations([...locations, ""])}
              >
                <Plus />
                Agregar sede
              </Button>
              <p className="text-xs text-muted-foreground">
                Hasta 10 sedes en este primer paso.
              </p>
            </div>
          )}
        </div>
        <div data-step="2" hidden={step !== 2} className="space-y-6">
          <fieldset>
            <legend className="mb-3 text-sm font-medium">
              ¿Qué te gustaría analizar más adelante?
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {Object.entries(analysisOptions).map(([value, label]) => (
                <label
                  key={value}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-sm",
                    interests.includes(value) &&
                      "border-primary/50 bg-accent/50",
                  )}
                >
                  <input
                    name="interests"
                    type="checkbox"
                    value={value}
                    checked={interests.includes(value)}
                    onChange={(e) =>
                      setInterests(
                        e.target.checked
                          ? [...interests, value]
                          : interests.filter((i) => i !== value),
                      )
                    }
                    className="size-4 accent-primary"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setInterests(["sales", "expenses", "cash"])}
          >
            <Sparkles />
            Configúralo por mí
          </Button>
          <div className="rounded-xl bg-muted/70 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <CheckCheck size={18} className="text-primary" />
              {name || "Tu negocio"}
            </div>
            <p className="text-sm text-muted-foreground">
              {countries.find((c) => c.code === country)?.name} · {currency} ·{" "}
              {businessTypes[kind]}
            </p>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Tu espacio estará listo. La carga y el análisis de datos
              financieros estarán disponibles en una próxima etapa.
            </p>
          </div>
        </div>
        {(validationError || state.error) && (
          <p
            role="alert"
            className="mt-5 rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
          >
            {validationError || state.error}
          </p>
        )}
        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
          {step > 0 ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setValidationError("");
                setStep(step - 1);
              }}
              disabled={pending}
            >
              <ArrowLeft />
              Atrás
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">Paso 1 de 3</span>
          )}
          {step < 2 ? (
            <Button key="next-step" type="button" onClick={next}>
              Continuar
              <ArrowRight />
            </Button>
          ) : (
            <Button key="submit-onboarding" type="submit" disabled={pending}>
              {pending ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <ArrowRight />
              )}
              {pending ? "Preparando tu espacio…" : "Entrar a mi negocio"}
            </Button>
          )}
        </div>
      </form>
      <p className="mt-5 text-center text-xs text-muted-foreground">
        A tu ritmo. Sin datos financieros obligatorios.
      </p>
    </div>
  );
}
