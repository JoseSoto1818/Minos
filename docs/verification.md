# Validación del Sprint 1

Validado en el entorno de desarrollo con Node 24.19.0, pnpm 11.19.0, Next.js 16.3.8, Chromium 151 y Supabase local (PostgreSQL 17, Auth y PostgREST reales). Sin mocks de autenticación ni datos financieros de ejemplo.

| Comprobación                       | Resultado                                                                                |
| ---------------------------------- | ---------------------------------------------------------------------------------------- |
| Instalación con lockfile congelado | Correcta y repetible                                                                     |
| TypeScript estricto                | Sin errores                                                                              |
| ESLint                             | Sin errores ni advertencias                                                              |
| Compilación de producción          | Correcta; rutas autenticadas dinámicas                                                   |
| Pruebas unitarias                  | 7 aprobadas                                                                              |
| PostgreSQL / pgTAP                 | 22 aprobadas, transacción revertida                                                      |
| Playwright, escritorio y móvil     | 4 aprobadas, ninguna omitida en la ejecución completa                                    |
| Servidor de producción             | Acceso, inicio y configuración verificados en escritorio y móvil, sin errores de consola |

## Recorridos probados

Registro real con correo/contraseña → onboarding con país, moneda, sector, tipo y sede → bienvenida → actualización de empresa → nueva sede → tema oscuro → equipo → segunda empresa → selector de empresa → cierre de sesión → nuevo acceso con datos conservados. Usuarios sin empresa van a onboarding; usuarios con empresa van al inicio. Sin errores de página ni de consola en el recorrido completo.

También: protección de rutas privadas, mostrar/ocultar contraseña, persistencia del tema tras recarga, rechazo de enlaces de confirmación inválidos y ausencia de desbordamiento horizontal en pantallas verificadas.

Base de datos: creación atómica, rol owner, persistencia de preferencias/sedes, auditoría, bloqueo de cambios de creador/membresías, zonas inválidas, rollback por sedes duplicadas, aislamiento entre dos empresas, protección de perfiles y auditoría, bloqueo de escritura de viewer/accountant, escritura admin y rechazo de anon.

## Revisión visual

Revisados registro, onboarding, bienvenida y configuración en escritorio y móvil; modos claro y oscuro. El diseño usa la información introducida por las cuentas QA. No se muestran KPIs inventados. Las capturas seleccionadas están en `docs/screenshots/`.

- [Acceso de escritorio](screenshots/acceso-escritorio.png)
- [Inicio de escritorio](screenshots/inicio-escritorio.png)
- [Inicio móvil](screenshots/inicio-movil.png)
- [Configuración oscura de escritorio](screenshots/configuracion-oscura-escritorio.png)
- [Configuración oscura móvil](screenshots/configuracion-oscura-movil.png)

## Límites de la validación

- La confirmación por correo está deshabilitada en el stack local; falta validar entrega SMTP y confirmación real en el proyecto hospedado.
- No se ha desplegado en Vercel ni probado restauración del snapshot en otra tarea.
- El healthcheck interno de Auth marca un falso negativo por el proxy de esta máquina. Las solicitudes HTTP de salud y el registro/login reales sí funcionan; README explica el diagnóstico y la comprobación funcional requerida.
- La descarga de Chromium de Playwright fue bloqueada por la política de red; se usó el Chromium ya instalado, sin ampliar la red ni desactivar TLS.
- Invitaciones, gestión UI de roles y funciones financieras no pertenecen a esta entrega. No se probaron funcionalidades inexistentes.

## Configuración reutilizable

Se guardaron `install_script` y `start_skill` en el borrador de configuración del entorno. Describen instalación congelada, inicio local, migraciones, comprobaciones y pruebas, preservando archivos y volúmenes. Guardar el borrador no publica el entorno: revisarlo y guardarlo en Configuración del entorno y luego publicarlo es un paso del producto.

## Extensión visual: primer paso para agregar información

Validada la navegación Inicio → “Agregar mis números” → selector de tres opciones → entrada manual con seis categorías. Las opciones de Excel/CSV y plantilla llevan a pantallas iniciales con disponibilidad futura explícita, sin carga ni descarga simulada.

Las pruebas Playwright existentes ahora también verifican estas rutas protegidas, los seis diálogos, cierre con Escape y recuperación del foco, regreso a las opciones y ausencia de peticiones de escritura durante la exploración. En móvil se verifica que el CTA quede por encima de la barra inferior antes de hacer scroll. Se mantienen las comprobaciones de autenticación, onboarding, empresas y configuración.

TypeScript, lint y build correctos; 7 pruebas unitarias, 22 comprobaciones SQL y 4 recorridos E2E aprobados. Las capturas de la versión de producción se revisaron en escritorio y móvil, claro y oscuro, sin errores de consola ni desbordamiento horizontal.

- [Inicio móvil con CTA visible](screenshots/entrada-inicial/inicio-movil.png)
- [Opciones en escritorio](screenshots/entrada-inicial/opciones-escritorio.png)
- [Opciones en móvil](screenshots/entrada-inicial/opciones-movil.png)
- [Categorías manuales en escritorio](screenshots/entrada-inicial/manual-escritorio.png)
- [Categorías manuales en móvil](screenshots/entrada-inicial/manual-movil.png)
- [Opciones en modo oscuro](screenshots/entrada-inicial/opciones-oscuro-escritorio.png)

No se incorporan cálculos, persistencia financiera, importadores ni IA. No cambia el esquema, RLS, autenticación ni las acciones existentes. Esta extensión visual no supone comenzar el Sprint 2 completo ni hacer merge.

## Sprint 2A: captura financiera persistente

TypeScript, lint y build de producción correctos. Pasan 14 pruebas unitarias, 68 comprobaciones SQL (46 financieras y las 22 de Sprint 1) y 4 recorridos Playwright en escritorio/móvil, sin pruebas omitidas.

Cobertura: los seis formularios guardan en Supabase local; ingreso/gasto pendiente crea su cuenta sin duplicados; edición, cierre/restauración y eliminación confirmada; rechazo de importes inválidos y versiones antiguas; aislamiento de las cinco entidades, roles lector/contador/propietario y auditoría; dashboard con importes persistidos, moneda actual, filtros de período y conservación del formulario ante errores. Las cuentas vinculadas también se cierran automáticamente al guardar un pago completo y conservan el pago anterior para restaurar.

Capturas de la compilación de producción revisadas sin errores de consola ni desbordamiento horizontal. Muestran datos QA guardados mediante los formularios en Supabase local, no datos incorporados ni mocks en el producto:

- [Dashboard escritorio claro](screenshots/sprint-2a/dashboard-escritorio-claro.png)
- [Dashboard escritorio oscuro](screenshots/sprint-2a/dashboard-escritorio-oscuro.png)
- [Inicio móvil](screenshots/sprint-2a/inicio-movil-claro.png)
- [Dashboard móvil completo](screenshots/sprint-2a/dashboard-movil-claro.png)
- [Dashboard móvil oscuro](screenshots/sprint-2a/dashboard-movil-oscuro.png)
- [Formulario escritorio](screenshots/sprint-2a/formulario-escritorio.png)
- [Formulario móvil](screenshots/sprint-2a/formulario-movil.png)
- [Historial escritorio](screenshots/sprint-2a/historial-escritorio.png)
- [Historial móvil](screenshots/sprint-2a/historial-movil.png)

Migración nueva: `202610070001_financial_entry.sql`. Debe aplicarse antes de desplegar la aplicación. Las definiciones de indicadores, permisos y límites están en [Sprint 2A](sprint-2a.md). No se desplegó en producción ni se hizo merge.
