# Seguridad

## Identidad

Supabase Auth gestiona correo/contraseña. `@supabase/ssr` mantiene cookies y `proxy.ts` refresca sesiones. Las lecturas y acciones privadas verifican identidad con `auth.getUser()`; no confían en una sesión sin validar.

Server Components para lecturas, Server Actions para mutaciones. Cada acción vuelve a verificar usuario, empresa, rol y entrada Zod; Next.js conserva sus comprobaciones de origen. No se usa clave service-role. Errores de UI sin SQL, IDs ni trazas.

Confirmación admite PKCE o token_hash de tipo email. Redirección fija al origen configurado; no acepta un destino externo del usuario. Configurar HTTPS y confirmación real en producción. Registro con respuesta neutral cuando Supabase requiere confirmación.

## Tenant y roles

RLS en todas las tablas públicas. Helpers privados de membresía SECURITY DEFINER con `search_path = ''`, ejecución explícita para authenticated y sin exposición en esquemas API; evitan políticas recursivas.

| Operación                                       | Owner | Admin | Accountant | Viewer |
| ----------------------------------------------- | ----- | ----- | ---------- | ------ |
| Consultar empresa, sedes, preferencias y equipo | Sí    | Sí    | Sí         | Sí     |
| Editar configuración y agregar sedes            | Sí    | Sí    | No         | No     |
| Leer auditoría                                  | Sí    | Sí    | No         | No     |
| Cambiar membresías/propiedad por API            | No    | No    | No         | No     |

Owner se asigna por `create_company`. Cambios de propiedad y miembros requieren futuras RPC específicas y probadas. Accountant tendrá permisos financieros cuando exista el módulo.

Cookie de empresa: HTTP-only, SameSite=Lax, Secure en producción. Es una preferencia; no otorga permisos. Se revalida la membresía. Las acciones toman el tenant del contexto verificado, nunca del formulario.

Permisos por columna impiden cambiar claves tenant, creador, rol y timestamps. Auditoría por triggers, sin edición/borrado del cliente. Ninguna tabla del Sprint 1 concede DELETE. Pruebas SQL con rol authenticated real y distintos JWT sub; no con una clave que omita RLS.

## Historial y operación

No hay borrado financiero ni de empresas. Las sedes prevén archivo. Siguientes sprints: edición, pago, cierre y archivo; borrado excepcional restaurable con autorización en servidor y doble confirmación del registro/importe. Auditar antes/después.

No registrar credenciales/sesiones. `.env*`, trazas y dependencias se ignoran. E2E solo en LOCAL. Antes de producción: SMTP, confirmación, límites de Auth, copias de seguridad, redirects exactos y pruebas con dos usuarios independientes. Las pruebas locales no validan entrega real de correo ni un proyecto hospedado.
