import { CLASES_NAVE, type BorradorNave, type ClaseNave, type ErroresNave } from '../types/nave';

export function esClaseNave(valor: string): valor is ClaseNave {
  return (CLASES_NAVE as readonly string[]).includes(valor);
}

export type ResultadoCombustible =
  | { ok: true; valor: number }
  | { ok: false; error: string };

export function validarCombustible(texto: string): ResultadoCombustible {
  const recortado = texto.trim();
  if (recortado === '') {
    return { ok: false, error: 'Indica el combustible de la nave.' };
  }
  if (!/^-?\d+$/.test(recortado)) {
    return { ok: false, error: 'El combustible debe ser un número entero entre 0 y 100.' };
  }
  const valor = Number(recortado);
  if (valor < 0 || valor > 100) {
    return { ok: false, error: 'El combustible debe ser un número entero entre 0 y 100.' };
  }
  return { ok: true, valor };
}

// Devuelve {} si los datos son válidos. La unicidad del nombre la comprueba navesService.
export function validarNave(borrador: BorradorNave): ErroresNave {
  const errores: ErroresNave = {};

  if (borrador.nombre.trim() === '') {
    errores.nombre = 'Escribe el nombre de la nave.';
  }

  if (!esClaseNave(borrador.clase)) {
    errores.clase = 'Elige la clase de la nave: exploradora, carguera o transporte.';
  }

  const resultado =
    borrador.combustible === null
      ? validarCombustible('')
      : validarCombustible(String(borrador.combustible));
  if (!resultado.ok) {
    errores.combustible = resultado.error;
  }

  return errores;
}
