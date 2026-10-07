# Modelo de datos · Sprint 1

Migración `supabase/migrations/202610060001_foundation.sql`. UUID, claves foráneas, timestamps UTC y RLS en todas las tablas públicas.

| Tabla                 | Propósito                                                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `profiles`            | Perfil por usuario Auth, correo sincronizado, nombre opcional; visible para uno mismo y miembros de empresas compartidas.  |
| `companies`           | Nombre, país, moneda ISO soportada, zona IANA validada en PostgreSQL, sector, tipo de negocio y opción de sedes.           |
| `company_memberships` | Unión usuario/empresa y rol; índice único por usuario/empresa y como máximo un owner. Sin mutación directa desde clientes. |
| `company_preferences` | Intereses y fecha de onboarding; una fila por empresa.                                                                     |
| `locations`           | Sedes con tenant, creador, nombre y archivo. Nombre activo único por empresa sin distinguir mayúsculas/espacios externos.  |
| `audit_events`        | Actor, empresa, entidad, acción, antes/después y timestamp; inmutable para clientes, lectura owner/admin.                  |

`create_company` es una RPC autenticada y transaccional: crea empresa, propietario, preferencias y hasta diez sedes iniciales. Un error revierte todo, incluidos eventos. No exige sedes ni intereses. Un trigger de Auth crea perfiles.

Permisos por columna impiden mover filas entre tenants, cambiar creador, fechas o roles. Índices por membresía/tenant y tiempo de auditoría. La empresa activa es una cookie HTTP-only revalidada contra membresías; una selección inválida vuelve a la primera empresa válida.

## Entidades previstas, aún sin tablas

`company_invitations`, `products_services`, `categories`, `financial_accounts`, `transactions`, `imports`, `import_column_mappings`, `classification_rules`, `counterparties`, `receivables`, `receivable_payments`, `payables`, `payable_payments`, `budgets`, `goals`.

Las entidades financieras tendrán tenant, referencias que impidan cruces entre empresas, creador, timestamps e historial/archivo. Dinero: `numeric(18,2)` o precisión decimal justificada; nunca float. Conservar moneda/importe original y conversión/tasa/fecha solo si se conocen.

No existe borrado de empresas por API. Eliminar un propietario desde Auth requiere antes un procedimiento de transferencia/preservación que aún no se implementa. No borrar historia en cascada como flujo normal.
