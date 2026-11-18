# Wireframes · Spec 07 · Completar una misión (HU-1.5)

Wireframes de baja fidelidad, en grises, generados con `/wireframes HU-1.5` a partir de los criterios de `docs/backlog/E1-flota-y-misiones.md`. Deciden la **estructura**: qué hay en la pantalla, dónde, en qué orden y con qué textos. El estilo lo decide `DESIGN.md` y el comportamiento, la spec 07.

Solo se dibuja la Tarjeta de nave con sus misiones abiertas. Los paneles «Registrar nave» y «Asignar misión» no cambian y aparecen como cajas punteadas.

## Estados

| Estado | Archivos | Criterios |
| --- | --- | --- |
| Lista de misiones | `lista-movil.svg`, `lista-escritorio.svg` | HU-1.5-CA1, HU-1.5-CA7 |
| Formulario abierto | `formulario-movil.svg`, `formulario-escritorio.svg` | HU-1.5-CA2, HU-1.5-CA7 |
| Error de validación | `error-validacion-movil.svg` | HU-1.5-CA3 |
| Guardando | `guardando-movil.svg` | HU-1.5-CA4 |
| Misión completada | `exito-movil.svg` | HU-1.5-CA5 |
| Error de conexión | `error-conexion-movil.svg` | HU-1.5-CA6 |

Todos los criterios aparecen en al menos un wireframe. HU-1.5-CA7 se cubre con que todos los estados móviles caben en 390 de ancho.

## Decisiones

Lo que el wireframe decide y los criterios no:

1. **El formulario se abre dentro de la misma misión**, debajo del destino y la fecha, no en un panel aparte ni en un diálogo.
2. **«Completar» es un botón secundario en cada misión pendiente que ya puede completarse** (despegue hoy o pasado). «Confirmar» es el **único botón primario** visible y solo aparece con el formulario abierto. «Cancelar» es secundario.
3. **Una misión a la vez (HU-1.5-CA2):** mientras hay un formulario abierto, el «Completar» de las demás misiones aparece deshabilitado. La misión con despegue futuro no muestra «Completar».
4. **La misión completada** muestra la insignia «Completada» a la derecha del destino, sin botón. No hay acción para deshacer.
5. **El error de validación** aparece justo debajo del campo, y el campo lleva el borde más grueso. Vacío muestra «Indica el combustible de la nave.»; 120 muestra «El combustible debe ser un número entero entre 0 y 100.» (este SVG dibuja el caso 120).
6. **Guardando:** «Confirmar» cambia a «Guardando…» y se deshabilita junto con «Cancelar», sin cambiar de ancho.
7. **El aviso «Misión completada.»** aparece justo debajo de la misión que se completó, porque el formulario se cierra.
8. **El aviso «No se pudo completar la misión.»** aparece debajo de «Confirmar» y «Cancelar», con el formulario todavía abierto y el valor escrito conservado.
9. **La etiqueta del campo es «Combustible restante»**, para no confundirlo con otros campos de combustible de la tarjeta.
10. En **escritorio**, el botón y la insignia van en la misma fila que destino y fecha cuando hay ancho; en **móvil** (y en las tarjetas angostas de la grilla), van debajo de la fecha.
