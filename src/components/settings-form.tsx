"use client";
import { useActionState, useState } from "react";
import { LoaderCircle, Pencil, Plus, Save } from "lucide-react";
import { updateCompany, addLocation } from "@/app/actions/company";
import {
  countries,
  currencies,
  industries,
  businessTypes,
} from "@/lib/constants";
import type { ActionState, CompanyInput } from "@/lib/validation";
import { Button } from "./ui/button";
import { Field, Input, Select } from "./ui/field";

export function SettingsForm({
  company,
  companyId,
  editable,
}: {
  company: CompanyInput;
  companyId: string;
  editable: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(
    async (previous: ActionState, form: FormData) => {
      const result = await updateCompany(previous, form);
      if (result.success) setEditing(false);
      return result;
    },
    {},
  );
  if (!editing)
    return (
      <div className="space-y-5">
        <dl className="grid gap-5 sm:grid-cols-2">
          {[
            ["Nombre del negocio", company.name],
            ["Sector / actividad principal", company.industry],
            ["Tipo de negocio", businessTypes[company.business_type]],
            [
              "País",
              countries.find((c) => c.code === company.country_code)?.name,
            ],
            ["Moneda principal", company.base_currency],
            ["Zona horaria", company.timezone.replaceAll("_", " ")],
            [
              "Configuración de sedes",
              company.has_locations
                ? "Varias sedes"
                : "Una sola sede / sin sedes",
            ],
          ].map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="mt-1 break-words text-sm font-medium">{value}</dd>
            </div>
          ))}
        </dl>
        {state.success && (
          <p role="status" className="text-sm text-success">
            {state.success}
          </p>
        )}
        {editable ? (
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={() => setEditing(true)}
          >
            <Pencil />
            Editar perfil del negocio
          </Button>
        ) : (
          <p className="text-xs leading-5 text-muted-foreground">
            Puedes consultar esta información. Para cambiarla, habla con el
            propietario o un administrador.
          </p>
        )}
      </div>
    );
  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="company_id" value={companyId} />
      <p className="text-sm leading-6 text-muted-foreground">
        Actualiza tu perfil sin repetir la configuración inicial. Cambiar el
        tipo de negocio no elimina información. Si desactivas varias sedes, las
        sedes guardadas se conservarán.
      </p>
      <fieldset
        disabled={!editable || pending}
        className="grid gap-5 sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <Field label="Nombre del negocio" htmlFor="company-name">
            <Input
              autoFocus
              id="company-name"
              name="name"
              defaultValue={company.name}
              minLength={2}
              maxLength={100}
              required
            />
          </Field>
        </div>
        <Field label="País" htmlFor="country">
          <Select
            id="country"
            name="country_code"
            defaultValue={company.country_code}
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
            defaultValue={company.base_currency}
          >
            {currencies.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </Field>
        <Field label="Sector / actividad principal" htmlFor="industry">
          <Select id="industry" name="industry" defaultValue={company.industry}>
            {industries.map((i) => (
              <option key={i}>{i}</option>
            ))}
          </Select>
        </Field>
        <Field label="Tipo de negocio" htmlFor="business-type">
          <Select
            id="business-type"
            name="business_type"
            defaultValue={company.business_type}
          >
            {Object.entries(businessTypes).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Zona horaria"
          htmlFor="timezone"
          hint="Se usará para las fechas y los períodos de tu negocio."
        >
          <Select id="timezone" name="timezone" defaultValue={company.timezone}>
            {[
              ...new Set([
                company.timezone,
                ...countries.map((c) => c.timezone),
                ...Intl.supportedValuesOf("timeZone"),
              ]),
            ]
              .sort()
              .map((zone) => (
                <option key={zone} value={zone}>
                  {zone.replaceAll("_", " ")}
                </option>
              ))}
          </Select>
        </Field>
        <Field label="Sedes" htmlFor="has-locations">
          <Select
            id="has-locations"
            name="has_locations"
            defaultValue={String(company.has_locations)}
          >
            <option value="false">Una sola sede / sin sedes</option>
            <option value="true">Varias sedes</option>
          </Select>
        </Field>
      </fieldset>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-sm text-success">
          {state.success}
        </p>
      )}
      {editable ? (
        <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-5">
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => setEditing(false)}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? <LoaderCircle className="animate-spin" /> : <Save />}
            {pending ? "Guardando…" : "Guardar cambios"}
          </Button>
        </div>
      ) : (
        <p className="rounded-xl bg-muted p-3 text-xs leading-5 text-muted-foreground">
          Puedes consultar esta información. Para cambiarla, habla con el
          propietario o un administrador.
        </p>
      )}
    </form>
  );
}

export function LocationForm() {
  const [state, action, pending] = useActionState(addLocation, {});
  return (
    <form action={action} className="mt-5 space-y-3">
      <label className="text-sm font-medium" htmlFor="new-location">
        Nueva sede
      </label>
      <div className="flex gap-2">
        <Input
          id="new-location"
          name="name"
          placeholder="Por ejemplo, sede norte"
          maxLength={100}
          required
          disabled={pending}
        />
        <Button type="submit" variant="outline" disabled={pending}>
          <Plus />
          <span className="hidden sm:inline">Agregar</span>
          <span className="sr-only sm:hidden">Agregar sede</span>
        </Button>
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-sm text-success">
          {state.success}
        </p>
      )}
    </form>
  );
}
