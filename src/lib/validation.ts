import { z } from "zod";
import { countries, currencies, industries } from "./constants";

export const loginSchema = z.object({
  email: z.email("Escribe un correo válido.").trim().max(254),
  password: z.string().min(1, "Escribe tu contraseña.").max(128),
});
export const signupSchema = loginSchema.extend({
  password: z
    .string()
    .min(10, "Usa al menos 10 caracteres.")
    .max(128, "Usa un máximo de 128 caracteres."),
});
export const companySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Escribe el nombre de tu negocio (mínimo 2 caracteres).")
    .max(100),
  country_code: z
    .string()
    .refine(
      (value) => countries.some((c) => c.code === value),
      "Selecciona un país.",
    ),
  base_currency: z.enum(currencies),
  timezone: z.string().refine((value) => {
    try {
      new Intl.DateTimeFormat("es", { timeZone: value });
      return true;
    } catch {
      return false;
    }
  }, "Selecciona una zona horaria válida."),
  industry: z.enum(industries),
  business_type: z.enum(["products", "services", "both"]),
  has_locations: z.boolean(),
});
export const onboardingSchema = companySchema
  .extend({
    locations: z
      .array(z.string().trim().min(1).max(100))
      .max(10, "Puedes agregar hasta 10 sedes inicialmente."),
    interests: z
      .array(
        z.enum([
          "sales",
          "expenses",
          "cash",
          "receivables",
          "payables",
          "goals",
        ]),
      )
      .max(6),
  })
  .superRefine((data, ctx) => {
    if (!data.has_locations && data.locations.length)
      ctx.addIssue({
        code: "custom",
        path: ["locations"],
        message: "Activa las sedes para agregarlas.",
      });
    const normalized = data.locations.map((name) =>
      name.toLocaleLowerCase("es"),
    );
    if (new Set(normalized).size !== normalized.length)
      ctx.addIssue({
        code: "custom",
        path: ["locations"],
        message: "Cada sede necesita un nombre diferente.",
      });
  });
export type CompanyInput = z.infer<typeof companySchema>;
export type ActionState = { error?: string; success?: string };
