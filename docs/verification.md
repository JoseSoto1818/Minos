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
