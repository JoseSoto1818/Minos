# Minos

Visibilidad y gestión financiera para pequeñas y medianas empresas. Minos ayuda a entender el negocio con lenguaje cotidiano; complementa la contabilidad.

Esta entrega implementa **solo el Sprint 1**: registro e inicio de sesión, onboarding persistente, empresas y membresías, sedes, roles, configuración, navegación adaptable y temas claro/oscuro. El inicio es una bienvenida sin cifras financieras ficticias. Una extensión visual aprobada permite explorar “Agregar mis números”: entrada manual con seis tipos de información, archivo y plantilla. Todavía no captura, guarda ni procesa datos financieros.

## Stack

Next.js **16.3.8**, App Router, React, TypeScript estricto, Tailwind CSS 4, componentes con la arquitectura de shadcn/ui y **Base UI**, Lucide, next-themes, Zod y Supabase PostgreSQL/Auth. Geist se sirve localmente. Server Components y Server Actions usan Node.js; no se necesita clave de servicio.

Recharts, React Hook Form y Storage se incorporarán cuando un sprint requiera gráficos, formularios complejos o archivos.

## Requisitos e inicio

Node.js 22+ (validado con 24.19.0), pnpm 11.19.0 y Docker para Supabase local, o un proyecto Supabase hospedado.

```sh
pnpm install --frozen-lockfile
pnpm db:start
```

El primer arranque aplica las migraciones de `supabase/migrations/`. Usa `node scripts/configure-local.mjs` para crear `.env.local` automáticamente con los valores públicos locales, preservando cualquier archivo existente. Como alternativa, copia `.env.example` y completa la URL y clave **publishable** desde `pnpm exec supabase status`. No copies claves service-role, secret ni JWT.

```sh
pnpm dev
```

Abre el puerto 3000 en tu entorno de desarrollo. Regístrate y crea tu empresa. Localmente no se exige confirmar correo; producción sí debe exigirlo. Los datos persisten en volúmenes Docker y las sesiones en cookies. `pnpm db:stop` conserva datos; **`pnpm db:reset` los borra**, úsalo solo deliberadamente en desarrollo.

## Variables

| Variable                               | Uso                                                   |
| -------------------------------------- | ----------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | URL API del proyecto Supabase                         |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave pública; nunca service-role                     |
| `NEXT_PUBLIC_SITE_URL`                 | Origen de Minos; se usa para confirmaciones de correo |

Si faltan URL o clave pública, registro y acceso se deshabilitan con un mensaje claro. No hay modo de demostración que omita autenticación. Las variables públicas deben existir durante la compilación de Vercel. Reinicia después de editar `.env.local`.

## Supabase hospedado

1. Crea el proyecto y aplica ambas migraciones, en orden, con el editor SQL o `supabase db push` tras enlazar el CLI. Verifica el proyecto de destino.
2. Configura URL y clave publishable en el despliegue.
3. En Authentication → URL Configuration define el origen y permite exactamente `<origen>/auth/confirm`.
4. Activa confirmación de correo y configura SMTP. Para confirmaciones que funcionen también en otro navegador, usa en la plantilla Confirm signup: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`. También se admite PKCE con el enlace estándar de Supabase.
5. Verifica límites, políticas de contraseña y entrega real de correo. Prueba registro → confirmación → empresa → salir → volver.
6. Conserva los permisos explícitos y RLS de la migración.

En redes restringidas permite el hostname exacto de tu proyecto Supabase. Proyecto hospedado, SMTP y despliegue no se crean automáticamente.

## Comandos

```sh
pnpm dev                 # Desarrollo
pnpm typecheck           # Tipos de rutas + TypeScript
pnpm lint                # ESLint
pnpm test                # Validaciones y roles
pnpm build               # Compilación de producción
pnpm start               # Servir la compilación
pnpm db:test             # 22 pruebas pgTAP locales; rollback
MINOS_E2E_AUTH=1 pnpm test:e2e # Recorrido real, solo Supabase LOCAL
```

Sin `MINOS_E2E_AUTH=1`, los recorridos con cuentas se omiten explícitamente. Instala Chromium con `pnpm exec playwright install chromium` o usa `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/ruta/a/chromium`. Playwright prueba escritorio y móvil. Capturas y trazas están ignoradas y pueden contener sesiones de prueba: no publiques trazas.

## Entorno en la nube

El directorio personal de esta máquina es de solo lectura. Usa ubicaciones escribibles sin cambiar `HOME`:

```sh
export PNPM_HOME=/workspace/.local/pnpm
export XDG_DATA_HOME=/workspace/.local/share
export SUPABASE_HOME=/workspace/.local/supabase
export SUPABASE_USE_SLIM_IMAGES=true
pnpm install --frozen-lockfile
pnpm exec supabase start --ignore-health-check -x studio,imgproxy,storage-api,realtime,edge-runtime,logflare,vector,supavisor,postgres-meta
```

Las imágenes slim evitan el tamaño excesivo de PostgreSQL completo. En esta máquina la comprobación interna de Auth con `wget` usa el proxy para loopback y da un falso 403. `--ignore-health-check` permite conservar contenedores para diagnóstico: **verifica después** el JSON de `curl -fsS http://127.0.0.1:54321/auth/v1/health`, ejecuta `pnpm db:test` y prueba autenticación real. No interpretes un contenedor iniciado como servicio listo. Conserva proxy y verificación TLS para tráfico externo.

Chromium está en `/usr/bin/chromium`; no requiere otra descarga. Los servidores deben arrancarse en sesiones nuevas; los procesos no forman parte de una instantánea.

## Arquitectura y despliegue

- `src/app`: rutas, acciones de servidor y confirmación de correo.
- `src/lib/context.ts`: identidad verificada, membresías y empresa seleccionada.
- `src/lib/supabase`: cliente SSR y contrato de tipos de la base.
- `src/components`: interfaz y componentes Base UI.
- `supabase/migrations` y `supabase/tests`: esquema, RLS, permisos, auditoría y pruebas PostgreSQL.

En Vercel selecciona Next.js, configura las tres variables y compila con `pnpm build`. Aplica primero el esquema de Supabase. No se ha publicado un despliegue ni validado restauración en una tarea nueva.

Documentación: [producto](docs/product-spec.md), [datos](docs/data-model.md), [seguridad](docs/security.md), [validación](docs/verification.md).

## Límites

Sin transacciones, cálculos, importaciones, presupuestos, metas, reportes ni IA. Equipo muestra miembros y roles existentes; invitaciones/cambios de rol desde la UI quedan para después. Membresías adicionales requieren administración de base controlada. Sedes permite agregar; edición/archivo y visor de auditoría son posteriores. Apariencia se guarda en el navegador.

Siguiente paso: conectar el proyecto hospedado y validar correo/despliegue. Sprint 2 requiere aprobación explícita.
