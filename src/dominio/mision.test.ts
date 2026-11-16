import { describe, expect, it } from 'vitest';
import {
  describirDuracion,
  describirFechaDespegue,
  ordenarMisiones,
  validarMision,
} from './mision';
import type { BorradorMision, Mision } from '../types/mision';

const HOY = '2026-10-28';

const valida: BorradorMision = {
  naveId: '6f1c2a3e-0000-4000-8000-000000000001',
  destino: 'Estación Kepler',
  fechaDespegue: '2026-10-29',
  duracionDias: 5,
};

function mision(parcial: Partial<Mision> & Pick<Mision, 'fechaDespegue' | 'createdAt'>): Mision {
  return {
    id: parcial.id ?? 'm1',
    naveId: parcial.naveId ?? 'n1',
    destino: parcial.destino ?? 'Destino',
    fechaDespegue: parcial.fechaDespegue,
    duracionDias: parcial.duracionDias ?? 1,
    createdAt: parcial.createdAt,
  };
}

describe('validarMision', () => {
  it('acepta una misión con todos sus datos válidos', () => {
    expect(validarMision(valida, HOY)).toEqual({});
  });

  it('rechaza una misión sin nave', () => {
    expect(validarMision({ ...valida, naveId: '' }, HOY)).toEqual({ naveId: 'Elige la nave.' });
  });

  it.each(['', '   '])('rechaza el destino %j', (destino) => {
    expect(validarMision({ ...valida, destino }, HOY)).toEqual({ destino: 'Escribe el destino.' });
  });

  it('rechaza una misión sin fecha de despegue', () => {
    expect(validarMision({ ...valida, fechaDespegue: '' }, HOY)).toEqual({
      fechaDespegue: 'Indica la fecha de despegue.',
    });
  });

  it('acepta una fecha de despegue igual a hoy', () => {
    expect(validarMision({ ...valida, fechaDespegue: HOY }, HOY)).toEqual({});
  });

  it.each(['2026-10-27', '2025-12-31'])('rechaza la fecha de despegue %s', (fechaDespegue) => {
    expect(validarMision({ ...valida, fechaDespegue }, HOY)).toEqual({
      fechaDespegue: 'La fecha de despegue no puede ser anterior a hoy.',
    });
  });

  it('rechaza una misión sin duración', () => {
    expect(validarMision({ ...valida, duracionDias: null }, HOY)).toEqual({
      duracionDias: 'Indica la duración en días.',
    });
  });

  it('acepta una duración de 1 día', () => {
    expect(validarMision({ ...valida, duracionDias: 1 }, HOY)).toEqual({});
  });

  it.each([0, -1, 2.5, Number.NaN])('rechaza una duración de %d días', (duracionDias) => {
    expect(validarMision({ ...valida, duracionDias }, HOY)).toEqual({
      duracionDias: 'La duración debe ser un número entero de días, como mínimo 1.',
    });
  });

  it('devuelve todos los errores a la vez', () => {
    const vacia: BorradorMision = {
      naveId: '',
      destino: '',
      fechaDespegue: '',
      duracionDias: null,
    };
    expect(Object.keys(validarMision(vacia, HOY))).toEqual([
      'naveId',
      'destino',
      'fechaDespegue',
      'duracionDias',
    ]);
  });
});

describe('ordenarMisiones', () => {
  it('ordena por fecha de despegue de la más próxima a la más lejana (CA1)', () => {
    const tarde = mision({
      id: 'tarde',
      destino: 'Lejos',
      fechaDespegue: '2026-12-20',
      createdAt: '2026-01-01T10:00:00.000Z',
    });
    const pronto = mision({
      id: 'pronto',
      destino: 'Cerca',
      fechaDespegue: '2026-12-10',
      createdAt: '2026-01-02T10:00:00.000Z',
    });
    expect(ordenarMisiones([tarde, pronto]).map((m) => m.id)).toEqual(['pronto', 'tarde']);
  });

  it('si despegan el mismo día, ordena por createdAt (CA2)', () => {
    const despues = mision({
      id: 'despues',
      fechaDespegue: '2026-12-10',
      createdAt: '2026-01-02T12:00:00.000Z',
    });
    const antes = mision({
      id: 'antes',
      fechaDespegue: '2026-12-10',
      createdAt: '2026-01-01T08:00:00.000Z',
    });
    expect(ordenarMisiones([despues, antes]).map((m) => m.id)).toEqual(['antes', 'despues']);
  });

  it('no modifica el arreglo recibido', () => {
    const original = [
      mision({ id: 'b', fechaDespegue: '2026-12-20', createdAt: '2026-01-01T00:00:00.000Z' }),
      mision({ id: 'a', fechaDespegue: '2026-12-10', createdAt: '2026-01-01T00:00:00.000Z' }),
    ];
    const copia = [...original];
    ordenarMisiones(original);
    expect(original).toEqual(copia);
  });
});

describe('describirFechaDespegue', () => {
  it('devuelve Hoy si coincide con hoy (CA4)', () => {
    expect(describirFechaDespegue('2026-10-28', HOY)).toBe('Hoy');
  });

  it('devuelve Mañana si es el día siguiente (CA4)', () => {
    expect(describirFechaDespegue('2026-10-29', HOY)).toBe('Mañana');
  });

  it('devuelve Despegó el DD/MM/AAAA si es anterior a hoy (CA5)', () => {
    expect(describirFechaDespegue('2026-10-27', HOY)).toBe('Despegó el 27/10/2026');
  });

  it('devuelve DD/MM/AAAA para una fecha futura posterior a mañana', () => {
    expect(describirFechaDespegue('2026-11-05', HOY)).toBe('05/11/2026');
  });

  it('calcula mañana al cambiar de mes', () => {
    expect(describirFechaDespegue('2026-11-01', '2026-10-31')).toBe('Mañana');
  });

  it('calcula mañana al cambiar de año', () => {
    expect(describirFechaDespegue('2027-01-01', '2026-12-31')).toBe('Mañana');
  });
});

describe('describirDuracion', () => {
  it('usa el singular para 1 día (CA6)', () => {
    expect(describirDuracion(1)).toBe('1 día');
  });

  it('usa el plural para otros enteros (CA6)', () => {
    expect(describirDuracion(5)).toBe('5 días');
  });
});
