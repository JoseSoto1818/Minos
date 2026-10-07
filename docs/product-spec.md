# Contrato de producto

Minos es visibilidad, gestión y apoyo a decisiones para pymes hispanohablantes. Complementa sistemas contables; no es un libro mayor.

## Principios

1. Valor con información mínima. Lo opcional no bloquea el inicio.
2. Cero información fabricada: dinero, categorías, tasas, causas, historia y tendencias. Comunicar datos faltantes.
3. Español cotidiano: “Ventas / ingresos”, “Lo que costó vender o producir”, “Gastos para funcionar”, “Dinero disponible”.
4. Jerarquía: pregunta, respuesta, contexto, explicación y detalle. Tablas al final.
5. Dimensiones reales; no obligar a navegar por sedes/productos/clientes inexistentes.
6. Cálculos deterministas, importes decimales, zona horaria de la empresa. Color según significado financiero.
7. Seguridad en servidor y base; roles y RLS por empresa.
8. Diseño Ocean sobrio, accesible, adaptable y con modo oscuro.

## Sprint 1

Acceso, empresas, roles, preferencias, sedes básicas, onboarding de tres pasos, contexto multiempresa, bienvenida, equipo informativo, configuración y temas. No pedir dirección, teléfono, NIT, tamaño ni pago.

Navegación: Inicio, Equipo y Configuración. Ausencia de cifras explícita. Intereses opcionales, empresa/propietario creados en una sola transacción.

### Extensión visual aprobada: agregar información

Inicio ofrece “Agregar mis números” y el mensaje “Puedes empezar con tan poco como tus ventas y gastos del mes.” El recorrido `/inicio/agregar` presenta entrada manual, Excel/CSV y plantilla de Minos. La pantalla manual muestra los seis tipos solicitados (venta/ingreso, compra/gasto, dinero que te deben, dinero que debes, activo/inversión y préstamo) con ayuda contextual.

Esta extensión es solo visual y de navegación: no guarda información, no calcula ni importa archivos. Las pantallas de archivo y plantilla indican disponibilidad futura y mantienen deshabilitadas la carga/descarga. Se conserva la autenticación y el contexto de empresa del shell existente. No es una implementación del Sprint 2.

## Siguientes sprints, con aprobación

- 2: entrada rápida, transacciones, categorías, ventas, costos, rentabilidad y caja.
- 3: CSV/XLSX, mapeo reutilizable, revisión, duplicados y reglas deterministas.
- 4: cuentas por cobrar/pagar, abonos e historial, presupuestos y metas.
- 5: invitaciones, exportaciones PDF/Excel/CSV, auditoría visible y pulido de producción.

Preservar importes originales, moneda, conversiones conocidas y auditoría. No mezclar préstamos con ventas ni compras de activos con gastos operativos. Nunca asignar antigüedad sin vencimiento. Ganancia incompleta se llama “estimada”.

## Fuera del MVP

IA generativa, pronósticos, simulación, puntuación de salud, WhatsApp, apps nativas, integraciones contables/bancarias avanzadas, nómina/inventario avanzados, depreciación compleja, motor automático de divisas, marca blanca y suscripciones complejas. V2/V3 requieren otro contrato; no se presupone su contenido.

## Sprint 2A autorizado

Se habilita captura financiera manual real, persistencia, historial y dashboard inicial. El alcance y las reglas de cálculo/permisos se documentan en [Sprint 2A](sprint-2a.md). Las pantallas informativas de captura manual del bloque anterior se reemplazan por formularios funcionales; importación de archivos y herramientas avanzadas permanecen fuera de alcance.
