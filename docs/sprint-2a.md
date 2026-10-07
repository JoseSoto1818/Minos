# Sprint 2A — captura financiera manual

## Modelo y despliegue

Migración nueva: `supabase/migrations/202610070001_financial_entry.sql`. Aplicar después de las migraciones de Sprint 1, antes de desplegar la aplicación. No modifica ni elimina datos de las migraciones anteriores. En un proyecto enlazado, usar el flujo normal `supabase db push`; no usar reset en una base con datos. En local se aplicó únicamente esta migración a la base existente.

`financial_transactions` es el registro canónico para los seis tipos de captura. `receivables`, `payables`, `assets` y `loans` son entidades uno a uno con ese registro. Comparten el importe, concepto y auditoría mediante una referencia compuesta `(transaction_id, company_id)`, sin copias de importes que puedan desincronizarse. En una venta o gasto pendiente, la cuenta se crea dentro de la misma transacción SQL. Al editar se reutiliza el mismo vínculo.

Las columnas monetarias son `numeric(18,2)`. La API de consulta entrega importes como cadenas decimales y la aplicación agrega centavos con BigInt. Cada registro conserva la moneda de creación aunque cambie la moneda de la empresa. El selector de moneda del dashboard evita sumar monedas diferentes; no hay conversiones ni tasas inventadas.

## Permisos y consistencia

- Todo acceso requiere membresía; las cinco tablas tienen RLS. No se usan claves service-role.
- Propietario, administrador y contador pueden crear/editar/cerrar/restaurar; lector solo consulta.
- Las escrituras pasan por funciones atómicas con permisos explícitos, `search_path` vacío, validación de empresa/sede y privilegios revocados a PUBLIC/anon. No hay escritura directa de tablas desde el rol authenticated.
- Server Actions verifican la empresa activa y el rol. Si cambió la empresa en otra pestaña se rechaza el formulario. Una versión `updated_at` impide sobrescribir ediciones concurrentes.
- Creación, modificación, cierre, restauración y eliminación quedan en `audit_events`, con usuario y valores anteriores/nuevos. La auditoría de eliminación sobrevive al registro.
- Solo propietario/administrador pueden eliminar definitivamente cuentas **manuales cerradas**. Se exige marcar la confirmación y escribir ELIMINAR. No se permite eliminar movimientos origen, activos o préstamos.

## Captura e historial

Los seis formularios guardan en Supabase. Todos incluyen fecha, valor, concepto, categoría, sede opcional cuando está habilitada, notas y trazabilidad. Las ventas/gastos registran total y valor recibido/pagado; un pendiente genera su cuenta automáticamente. Una cuenta manual no se vuelve a contar como ingreso/gasto. El tipo de negocio actual determina el origen sugerido, sin impedir registrar otras actividades o editar registros históricos.

El historial permite editar registros activos, marcar pagado y cerrar, y restaurar. Cerrar guarda el pago anterior; restaurar recupera ese estado. Una cuenta manual ya ingresada como completamente pagada va directamente a cerrados; restaurarla conserva ese pago y permite editarlo explícitamente. Los cambios de pago actualizan el registro canónico, de modo que dashboard y cuenta vinculada coinciden.

Los activos conservan adquisición al contado/cuotas/préstamo y número de cuotas; no generan depreciación ni obligaciones automáticas. Una deuda asociada se ingresa por separado. Los préstamos conservan monto, saldo de principal, cuota, tasa anual y día de pago opcionales; no se calcula amortización. El saldo se limita al monto inicial en este bloque.

## Indicadores

- Ventas/ingresos: suma de ingresos con fecha dentro del período, cobrados o pendientes.
- Resultado estimado: ingresos menos compras/gastos del período. No es utilidad contable; no calcula impuestos, depreciación ni ajustes de inventario.
- Margen: resultado / ingresos; sin ingresos no se inventa un porcentaje.
- Cuentas por cobrar/pagar: saldo pendiente de movimientos y cuentas manuales con fecha hasta el cierre del período, usando **el estado de pago actual**. No representa un saldo histórico reconstruido por fecha de abono.
- Activos, préstamos y cuentas manuales no se suman a ventas/gastos.
- Semana empieza en lunes; meses calendario y rango personalizado usan fechas de la zona horaria de la empresa. Comparación con el mes/semana anterior o el rango contiguo de igual duración. Sin registros comparables se muestra “Sin período anterior”; con base cero no se divide por cero. Solo se comparan los registros cargados, no se infiere completitud.
- Gráficos: ingresos por fecha, gastos por categoría y origen de ingresos, con etiquetas e importes accesibles.

Una empresa sin registros conserva la bienvenida y “Agregar mis números”. Con datos, Inicio usa exclusivamente Supabase. Los únicos datos sintéticos están en pruebas locales: no hay mocks, semillas financieras ni demostraciones dentro del producto.

## Verificación y capturas

Las pruebas SQL se ejecutan dentro de transacciones con rollback. Las pruebas Playwright crean cuentas y empresas QA únicamente contra Supabase local y verifican los seis formularios, edición, cuentas pendientes, cierre/restauración, eliminación confirmada, aislamiento al cambiar de empresa y dashboard persistente. Las capturas de esta entrega muestran esos registros QA realmente guardados, no cifras incorporadas en la interfaz.

Resultado final: TypeScript, lint y build correctos; 14 pruebas unitarias, 68 SQL/RLS y 4 E2E aprobadas. [Capturas y evidencia](verification.md#sprint-2a-captura-financiera-persistente).
