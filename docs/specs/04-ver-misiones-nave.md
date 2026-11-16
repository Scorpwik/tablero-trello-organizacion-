# Spec 04 · Ver las misiones de una nave

**Historia:** HU-1.4 · Como jefe de hangar, quiero ver las misiones de cada nave, para saber qué tiene asignado antes de darle otra misión.
**Épica:** E1 · Flota y misiones. **Tickets:** T-15 a T-17.

### 0. Decisiones de esta spec
1. **Se muestran todas las misiones de la nave.** No existe estado de misión (Spec 01, decisión 2), así que «pendiente» equivale a «asignada» hasta que exista HU-1.5. `[SUPUESTO]`
2. **Orden:** por fecha de despegue, de la más próxima a la más lejana. Si dos misiones despegan el mismo día, va primero la que se asignó antes (`createdAt`).
3. **Carga bajo demanda:** las misiones de una nave se cargan al pulsar «Ver misiones», no al abrir la flota.
4. **Solo lectura:** esta spec no cambia el contador, la aptitud ni la base de datos. No necesita migración: la política de lectura de `misiones` ya existe.

### 1. Funciones puras (`src/dominio/mision.ts`)
- `ordenarMisiones(misiones: Mision[]): Mision[]`: devuelve un arreglo nuevo ordenado según la decisión 2. NO DEBE modificar el arreglo recibido.
- `describirFechaDespegue(fecha: string, hoy: string): string`: ambas en `YYYY-MM-DD`. Devuelve «Hoy» si coinciden, «Mañana» si `fecha` es el día siguiente a `hoy`, «Despegó el DD/MM/AAAA» si `fecha` es anterior a `hoy`, y «DD/MM/AAAA» en cualquier otro caso.
- `describirDuracion(dias: number): string`: «1 día» para 1 y «N días» para cualquier otro entero.

### 2. Servicio (`src/services/misionesService.ts`)
- `listarPorNave(naveId: string): Promise<Mision[]>`: lee las misiones de la nave con las columnas de `COLUMNAS_MISION` y las devuelve con `aMision`, sin ordenar. Si Supabase devuelve un error, lanza un `Error` con su mensaje.

### 3. Componente (`src/components/MisionesNave.tsx`)
- Se muestra como **último bloque** de la Tarjeta de nave, después de los motivos. Antes de escribir código, se añade este bloque 7 a la sección 6.7 de `DESIGN.md`.
- Un Botón secundario (DESIGN.md §6.3) con el texto «Ver misiones», que cambia a «Ocultar misiones» cuando la lista está abierta.
- Al abrir: «Cargando misiones…» mientras carga; «No se pudieron cargar las misiones.» como aviso de error (DESIGN.md §6.8) si falla; «Esta nave no tiene misiones.» si no hay ninguna.
- Cada misión es un `li` con el destino, la fecha de `describirFechaDespegue` en `--fuente-cifras` y la duración de `describirDuracion`.
- Solo usa tokens de `DESIGN.md`. La fecha de hoy se obtiene con `fechaLocalHoy()` de `src/lib/fecha.ts`.

### 4. Criterios de aceptación
- **HU-1.4-CA1:** con una nave que tiene dos misiones con despegue el 20/12/2026 y el 10/12/2026, al pulsar «Ver misiones» la app DEBE listar las dos, primero la del 10/12/2026.
- **HU-1.4-CA2:** con dos misiones que despegan el mismo día, la app DEBE mostrar primero la que se asignó antes.
- **HU-1.4-CA3:** con una nave sin misiones, la app DEBE mostrar «Esta nave no tiene misiones.».
- **HU-1.4-CA4:** una misión que despega hoy DEBE mostrar «Hoy», y una que despega mañana, «Mañana».
- **HU-1.4-CA5:** una misión con fecha de despegue anterior a hoy DEBE mostrar «Despegó el DD/MM/AAAA».
- **HU-1.4-CA6:** una misión de 1 día DEBE mostrar «1 día», y una de 5 días, «5 días».
- **HU-1.4-CA7:** si falla la carga, la app DEBE mostrar «No se pudieron cargar las misiones.», y el resto de la tarjeta DEBE seguir visible.
- **HU-1.4-CA8:** ver las misiones NO DEBE cambiar el contador ni la aptitud de la nave.

### 5. Verificación
| Criterio | Cómo |
| --- | --- |
| CA1, CA2 | Vitest: `ordenarMisiones` (incluye que no modifica el arreglo original) |
| CA4, CA5 | Vitest: `describirFechaDespegue` (hoy, mañana, ayer, fecha futura, cambio de mes y de año) |
| CA6 | Vitest: `describirDuracion` |
| CA3, CA7, CA8 | Manual en el navegador |

### 6. Tickets y archivos
| Ticket | Crea | Modifica |
| --- | --- | --- |
| T-15 · Reglas de presentación de misiones | — | `src/dominio/mision.ts`, `src/dominio/mision.test.ts` |
| T-16 · Listar y mostrar las misiones | `src/components/MisionesNave.tsx`, `src/styles/misiones.css` | `src/services/misionesService.ts`, `src/components/TarjetaNave.tsx`, `DESIGN.md` (§6.7, bloque 7) |
| T-17 · Verificar HU-1.4 | — | Esta spec (resultados de la prueba manual) |

### Pendientes
(La implementación anota aquí lo que encuentre fuera de alcance.)
