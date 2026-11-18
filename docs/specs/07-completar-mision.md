# Spec 07 · Completar una misión

**Historia:** HU-1.5 · Como jefe de hangar, quiero marcar una misión pendiente como completada, para dejar constancia de que la nave volvió y anotar el combustible que le queda.
**Épica:** E1 · Flota y misiones (con la parte de E2 que exige R4). **Reglas:** R3 y R4. **Tickets:** T-22 a T-24.
**Criterios:** HU-1.5-CA1 a CA7, en `docs/backlog/E1-flota-y-misiones.md`.

### 0. Decisiones de esta spec
1. **Una misión es `pendiente` o `completada`** (supuesto del PRD). Las misiones que ya existen quedan como pendientes.
2. **Completar es una sola operación en la base de datos:** marca la misión como completada y reemplaza el combustible de la nave (R4). Si una de las dos partes falla, no cambia nada.
3. **Completar no cambia el contador** (R3): el contador sigue contando las misiones creadas después de la última revisión, estén pendientes o completadas.
4. **Una misión completada no vuelve a pendiente.** No hay deshacer.
5. **Solo se completa desde el día de despegue** (hoy o una fecha ya pasada). Una misión con despegue futuro no ofrece «Completar».
6. **El 0 % de combustible restante se acepta** y deja la nave no apta por combustible.

### 1. Pantallas
Wireframes aprobados en `docs/specs/07-completar-mision/wireframes/` (ver su `README.md`).

| Estado | Wireframes | Criterios |
| --- | --- | --- |
| Lista de misiones | `lista-movil.svg`, `lista-escritorio.svg` | CA1, CA7 |
| Formulario abierto | `formulario-movil.svg`, `formulario-escritorio.svg` | CA2, CA7 |
| Error de validación | `error-validacion-movil.svg` | CA3 |
| Guardando | `guardando-movil.svg` | CA4 |
| Misión completada | `exito-movil.svg` | CA5 |
| Error de conexión | `error-conexion-movil.svg` | CA6 |

- **Normativo:** la estructura, el orden de los elementos y los textos de los wireframes, y las decisiones de su `README.md`.
- **No normativo:** colores, tipografía y espacios. Vienen de `DESIGN.md`.
- Antes del código se actualiza `DESIGN.md`: §6.3 (el botón primario «Confirmar» dentro de la Tarjeta de nave) y §6.7, bloque 7 (completar una misión en la lista).

### 2. Base de datos
Archivo nuevo: `supabase/migraciones/004_completar_mision.sql`.
- Columna `estado` en `misiones`: texto, no nulo, por defecto `'pendiente'`, con `check (estado in ('pendiente', 'completada'))`.
- Función `completar_mision(p_mision_id uuid, p_combustible integer)`, con `security invoker`: marca la misión como completada solo si está pendiente, reemplaza el combustible de su nave y devuelve la nave actualizada. Si la misión no existe o ya estaba completada, lanza un error.
- Permiso para `anon`: `update` solo sobre la columna `estado` de `misiones`, con una política que solo permite pasar de `pendiente` a `completada` (`using (estado = 'pendiente') with check (estado = 'completada')`), y `execute` sobre la función.
- Las migraciones 002 y 003 (specs 05 y 06) no están aplicadas: 001 solo permite `select` e `insert` en `naves` y `misiones`. Para que la función pueda reemplazar el tanque, 004 concede además `update` únicamente sobre la columna `combustible` de `naves`, con su política RLS. Ningún otro permiso. Si 003 se aplica después, no debe ampliar esos permisos.

### 3. Tipos y funciones puras
- `src/types/mision.ts`: `Mision` gana `estado: EstadoMision`, con `type EstadoMision = 'pendiente' | 'completada'`.
- `src/dominio/mision.ts`: `puedeCompletar(mision: Pick<Mision, 'estado' | 'fechaDespegue'>, hoy: string): boolean`. Verdadero solo si está pendiente y `fechaDespegue` es hoy o anterior.
- `src/dominio/nave.ts`: `validarCombustible(texto: string): { ok: true; valor: number } | { ok: false; error: string }`. Vacío o solo espacios: «Indica el combustible de la nave.». No numérico, decimal, negativo o mayor que 100: «El combustible debe ser un número entero entre 0 y 100.». `validarNave` pasa a usarla, sin duplicar mensajes. (La spec 06 todavía no está implementada.)

### 4. Servicios
- `src/services/misionesService.ts`: `COLUMNAS_MISION` incluye `estado`, y `aMision` lo lee. Nueva función `completar(misionId: string, combustible: number): Promise<Nave>`, que llama a `completar_mision` con `rpc` y devuelve la nave con `aNave`. Lanza un `Error` si Supabase falla.

### 5. Componentes
- `src/components/MisionesNave.tsx`: muestra cada misión según los wireframes. Usa `validarCombustible` al confirmar y no llama a `completar` si hay error. Avisa a la tarjeta con la nave actualizada para que cambien la barra de combustible y la aptitud.
- `src/components/TarjetaNave.tsx` y `src/components/ListaNaves.tsx`: reciben la nave actualizada sin recargar la página.
- `.boton--secundario` se pasa de `misiones.css` a `formularios.css` si hace falta reutilizarlo.

### 6. Criterios de aceptación
HU-1.5-CA1 a CA7, tal como están en el backlog. La interfaz DEBE seguir la estructura de los wireframes y NO DEBE cambiar el contador al completar.

### 7. Verificación
| Criterio | Cómo |
| --- | --- |
| CA3 | Vitest: `validarCombustible` (vacío, espacios, 120, decimal, 0 y 100) y `puedeCompletar` (pendiente hoy, pendiente pasada, pendiente futura, completada) |
| CA1 a CA7 | Capturas comparadas con los wireframes, más prueba en el navegador contra Supabase |

**Antes de capturar:** con `npm run dev` corriendo, la primera nave de la flota debe tener al menos dos misiones pendientes que ya puedan completarse (despegue hoy o pasado). La captura «exito» completa una misión de verdad: por eso va al final.

```bash
npm run captura -- 07-completar-mision lista "clic:Ver misiones" "esperar:Completar"
npm run captura -- 07-completar-mision formulario "clic:Ver misiones" "clic:Completar"
npm run captura -- 07-completar-mision error-validacion --anchos 390 "clic:Ver misiones" "clic:Completar" "clic:Confirmar"
npm run captura -- 07-completar-mision guardando --anchos 390 "clic:Ver misiones" "clic:Completar" "escribir:Combustible restante=40" "lento" "clic:Confirmar"
npm run captura -- 07-completar-mision error-conexion --anchos 390 "clic:Ver misiones" "clic:Completar" "escribir:Combustible restante=40" "sin-red" "clic:Confirmar" "esperar:No se pudo completar la misión."
npm run captura -- 07-completar-mision exito --anchos 390 "clic:Ver misiones" "clic:Completar" "escribir:Combustible restante=40" "clic:Confirmar" "esperar:Misión completada."
```

El frontend no tiene tests automáticos de componentes: la interfaz se verifica con estas capturas y en el navegador.

### 8. Tickets y archivos
| Ticket | Crea | Modifica |
| --- | --- | --- |
| T-22 · Estado de misión y completar | `supabase/migraciones/004_completar_mision.sql` | `src/types/mision.ts`, `src/dominio/mision.ts`, `src/dominio/mision.test.ts`, `src/dominio/nave.ts`, `src/dominio/nave.test.ts`, `src/services/misionesService.ts` |
| T-23 · Completar desde la lista | — | `DESIGN.md` (§6.3 y §6.7), `src/components/MisionesNave.tsx`, `src/components/TarjetaNave.tsx`, `src/components/ListaNaves.tsx`, `src/styles/misiones.css`, `src/styles/formularios.css` |
| T-24 · Capturas y verificación | `docs/specs/07-completar-mision/capturas/` | Esta spec (resultados) |

### Resultados
**T-24, capturas (2026-11-18):** comparadas con los SVG de `wireframes/` (estructura, orden y textos; no colores). Capturas tomadas contra `http://localhost:5175`.

| Estado | Captura | Coincide |
| --- | --- | --- |
| Lista | `lista-movil.png`, `lista-escritorio.png` | Sí: «Completar» en cada misión pendiente con despegue hoy o pasado; textos de destino, fecha y duración. En escritorio el botón comparte fila cuando cabe. |
| Formulario | `formulario-movil.png`, `formulario-escritorio.png` | Sí: campo «Combustible restante», «Confirmar» primario, «Cancelar» secundario, formulario dentro de la misma misión. El «Completar» de la otra misión queda deshabilitado. |
| Error de validación | `error-validacion-movil.png` | Sí: «Indica el combustible de la nave.» bajo el campo (comando de la spec: Confirmar vacío). El SVG dibuja el caso 120; el texto de vacío es el de CA3. |
| Guardando | `guardando-movil.png` | Sí: «Guardando…» en el primario; Cancelar deshabilitado; el valor 40 se conserva. |
| Error de conexión | `error-conexion-movil.png` | Sí: «No se pudo completar la misión.» con el formulario abierto y el 40 conservado. |
| Éxito | `exito-movil.png` | Sí: insignia «Completada», aviso «Misión completada.» bajo esa misión, combustible de la nave en 40 %, contador sigue en 2 de 3. |

**T-22 y T-23:** `npm test` 70 de 70; `npm run build` sin errores.

### Pendientes
Ninguno.
