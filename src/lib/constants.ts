export const countries = [
  { code: "CO", name: "Colombia", currency: "COP", timezone: "America/Bogota" },
  {
    code: "MX",
    name: "México",
    currency: "MXN",
    timezone: "America/Mexico_City",
  },
  { code: "PE", name: "Perú", currency: "PEN", timezone: "America/Lima" },
  { code: "CL", name: "Chile", currency: "CLP", timezone: "America/Santiago" },
  {
    code: "AR",
    name: "Argentina",
    currency: "ARS",
    timezone: "America/Argentina/Buenos_Aires",
  },
  {
    code: "EC",
    name: "Ecuador",
    currency: "USD",
    timezone: "America/Guayaquil",
  },
  {
    code: "UY",
    name: "Uruguay",
    currency: "UYU",
    timezone: "America/Montevideo",
  },
  {
    code: "CR",
    name: "Costa Rica",
    currency: "CRC",
    timezone: "America/Costa_Rica",
  },
  { code: "PA", name: "Panamá", currency: "USD", timezone: "America/Panama" },
  {
    code: "GT",
    name: "Guatemala",
    currency: "GTQ",
    timezone: "America/Guatemala",
  },
  { code: "BO", name: "Bolivia", currency: "BOB", timezone: "America/La_Paz" },
  {
    code: "DO",
    name: "República Dominicana",
    currency: "DOP",
    timezone: "America/Santo_Domingo",
  },
  {
    code: "HN",
    name: "Honduras",
    currency: "HNL",
    timezone: "America/Tegucigalpa",
  },
  {
    code: "PY",
    name: "Paraguay",
    currency: "PYG",
    timezone: "America/Asuncion",
  },
  {
    code: "NI",
    name: "Nicaragua",
    currency: "NIO",
    timezone: "America/Managua",
  },
  {
    code: "BR",
    name: "Brasil",
    currency: "BRL",
    timezone: "America/Sao_Paulo",
  },
  { code: "ES", name: "España", currency: "EUR", timezone: "Europe/Madrid" },
  {
    code: "US",
    name: "Estados Unidos",
    currency: "USD",
    timezone: "America/New_York",
  },
] as const;
export const currencies = [
  "COP",
  "USD",
  "EUR",
  "MXN",
  "PEN",
  "CLP",
  "ARS",
  "BRL",
  "CRC",
  "UYU",
  "GTQ",
  "BOB",
  "DOP",
  "HNL",
  "PYG",
  "NIO",
] as const;
export const industries = [
  "Comercio",
  "Servicios profesionales",
  "Alimentos y restaurantes",
  "Tecnología",
  "Salud y bienestar",
  "Manufactura",
  "Educación",
  "Construcción",
  "Turismo y hospitalidad",
  "Otro",
] as const;
export const businessTypes = {
  products: "Productos",
  services: "Servicios",
  both: "Productos y servicios",
} as const;
export const analysisOptions = {
  sales: "Ventas",
  expenses: "Costos y gastos",
  cash: "Dinero disponible",
  receivables: "Dinero que me deben",
  payables: "Dinero que debo",
  goals: "Metas",
} as const;
export const roleLabels = {
  owner: "Propietario",
  admin: "Administrador",
  accountant: "Contador",
  viewer: "Solo lectura",
} as const;
export type Role = keyof typeof roleLabels;
export function canManageCompany(role: Role) {
  return role === "owner" || role === "admin";
}
