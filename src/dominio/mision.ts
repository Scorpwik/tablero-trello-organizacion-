import type { BorradorMision, ErroresMision, Mision } from '../types/mision';

export function puedeCompletar(
  mision: Pick<Mision, 'estado' | 'fechaDespegue'>,
  hoy: string,
): boolean {
  return mision.estado === 'pendiente' && mision.fechaDespegue <= hoy;
}

// `hoy` llega como YYYY-MM-DD; en ese formato las fechas se comparan bien como texto.
// Devuelve {} si los datos son válidos. La aptitud de la nave la comprueba puedeRecibirMision.
export function validarMision(borrador: BorradorMision, hoy: string): ErroresMision {
  const errores: ErroresMision = {};

  if (borrador.naveId === '') {
    errores.naveId = 'Elige la nave.';
  }

  if (borrador.destino.trim() === '') {
    errores.destino = 'Escribe el destino.';
  }

  if (borrador.fechaDespegue === '') {
    errores.fechaDespegue = 'Indica la fecha de despegue.';
  } else if (borrador.fechaDespegue < hoy) {
    errores.fechaDespegue = 'La fecha de despegue no puede ser anterior a hoy.';
  }

  const { duracionDias } = borrador;
  if (duracionDias === null) {
    errores.duracionDias = 'Indica la duración en días.';
  } else if (!Number.isInteger(duracionDias) || duracionDias < 1) {
    errores.duracionDias = 'La duración debe ser un número entero de días, como mínimo 1.';
  }

  return errores;
}

// Copia ordenada: fecha de despegue ascendente; a empate, createdAt ascendente.
export function ordenarMisiones(misiones: Mision[]): Mision[] {
  return [...misiones].sort((a, b) => {
    if (a.fechaDespegue !== b.fechaDespegue) {
      return a.fechaDespegue < b.fechaDespegue ? -1 : 1;
    }
    if (a.createdAt === b.createdAt) return 0;
    return a.createdAt < b.createdAt ? -1 : 1;
  });
}

function formatearDiaMesAnio(fecha: string): string {
  const [anio, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${anio}`;
}

function diaSiguiente(fecha: string): string {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const siguiente = new Date(anio, mes - 1, dia + 1);
  const y = siguiente.getFullYear();
  const m = String(siguiente.getMonth() + 1).padStart(2, '0');
  const d = String(siguiente.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function describirFechaDespegue(fecha: string, hoy: string): string {
  if (fecha === hoy) return 'Hoy';
  if (fecha === diaSiguiente(hoy)) return 'Mañana';
  if (fecha < hoy) return `Despegó el ${formatearDiaMesAnio(fecha)}`;
  return formatearDiaMesAnio(fecha);
}

export function describirDuracion(dias: number): string {
  return dias === 1 ? '1 día' : `${dias} días`;
}
