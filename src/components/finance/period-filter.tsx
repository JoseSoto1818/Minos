"use client";
import { useState } from "react";
import { Field, Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
export function PeriodFilter({
  period,
  currency,
  currencies,
  start,
  end,
}: {
  period: string;
  currency: string;
  currencies: string[];
  start: string;
  end: string;
}) {
  const [selected, setSelected] = useState(period);
  return (
    <form className="grid grid-cols-2 items-end gap-3 rounded-2xl border border-border bg-card p-5 md:grid-cols-3">
      <Field label="Período" htmlFor="period">
        <Select
          id="period"
          name="period"
          value={selected}
          onChange={(event) => setSelected(event.target.value)}
        >
          <option value="week">Esta semana</option>
          <option value="previous-week">Semana anterior</option>
          <option value="month">Este mes</option>
          <option value="previous-month">Mes anterior</option>
          <option value="custom">Rango personalizado</option>
        </Select>
      </Field>
      <Field label="Moneda" htmlFor="currency">
        <Select id="currency" name="currency" defaultValue={currency}>
          {currencies.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
      </Field>
      {selected === "custom" && (
        <>
          <Field label="Desde" htmlFor="start">
            <Input
              id="start"
              name="start"
              type="date"
              required
              defaultValue={start}
            />
          </Field>
          <Field label="Hasta" htmlFor="end">
            <Input
              id="end"
              name="end"
              type="date"
              required
              defaultValue={end}
            />
          </Field>
        </>
      )}
      <Button type="submit" className="col-span-2 md:col-span-1">
        Aplicar período
      </Button>
    </form>
  );
}
