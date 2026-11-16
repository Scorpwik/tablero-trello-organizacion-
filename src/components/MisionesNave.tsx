import { useState } from 'react';
import {
  describirDuracion,
  describirFechaDespegue,
  ordenarMisiones,
} from '../dominio/mision';
import { fechaLocalHoy } from '../lib/fecha';
import { misionesService } from '../services/misionesService';
import type { Mision } from '../types/mision';
import '../styles/misiones.css';

interface Props {
  naveId: string;
}

type Estado =
  | { fase: 'cerrado' }
  | { fase: 'cargando' }
  | { fase: 'error' }
  | { fase: 'listo'; misiones: Mision[] };

export default function MisionesNave({ naveId }: Props) {
  const [estado, setEstado] = useState<Estado>({ fase: 'cerrado' });

  async function abrir() {
    setEstado({ fase: 'cargando' });
    try {
      const misiones = ordenarMisiones(await misionesService.listarPorNave(naveId));
      setEstado({ fase: 'listo', misiones });
    } catch {
      setEstado({ fase: 'error' });
    }
  }

  function alternar() {
    if (estado.fase === 'cerrado') {
      void abrir();
      return;
    }
    setEstado({ fase: 'cerrado' });
  }

  const abierto = estado.fase !== 'cerrado';
  const hoy = fechaLocalHoy();

  return (
    <div className="misiones-nave">
      <button type="button" className="boton boton--secundario" onClick={alternar}>
        {abierto ? 'Ocultar misiones' : 'Ver misiones'}
      </button>

      {estado.fase === 'cargando' && (
        <p className="misiones-cargando">Cargando misiones…</p>
      )}

      {estado.fase === 'error' && (
        <p className="aviso aviso--error" role="alert">
          No se pudieron cargar las misiones.
        </p>
      )}

      {estado.fase === 'listo' && estado.misiones.length === 0 && (
        <p className="misiones-vacio">Esta nave no tiene misiones.</p>
      )}

      {estado.fase === 'listo' && estado.misiones.length > 0 && (
        <ul className="lista-misiones">
          {estado.misiones.map((mision) => (
            <li key={mision.id} className="item-mision">
              <span className="mision-destino">{mision.destino}</span>
              <span className="mision-fecha">
                {describirFechaDespegue(mision.fechaDespegue, hoy)}
              </span>
              <span className="mision-duracion">{describirDuracion(mision.duracionDias)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
