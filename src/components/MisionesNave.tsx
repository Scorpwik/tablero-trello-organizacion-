import { useState } from 'react';
import {
  describirDuracion,
  describirFechaDespegue,
  ordenarMisiones,
  puedeCompletar,
} from '../dominio/mision';
import { validarCombustible } from '../dominio/nave';
import { fechaLocalHoy } from '../lib/fecha';
import { misionesService } from '../services/misionesService';
import type { Mision } from '../types/mision';
import type { Nave } from '../types/nave';
import '../styles/misiones.css';

interface Props {
  naveId: string;
  onNaveActualizada: (nave: Nave) => void;
}

type Estado =
  | { fase: 'cerrado' }
  | { fase: 'cargando' }
  | { fase: 'error' }
  | { fase: 'listo'; misiones: Mision[] };

export default function MisionesNave({ naveId, onNaveActualizada }: Props) {
  const [estado, setEstado] = useState<Estado>({ fase: 'cerrado' });
  const [misionAbierta, setMisionAbierta] = useState<string | null>(null);
  const [combustible, setCombustible] = useState('');
  const [errorCampo, setErrorCampo] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorConexion, setErrorConexion] = useState(false);
  const [exitoId, setExitoId] = useState<string | null>(null);

  async function abrir() {
    setEstado({ fase: 'cargando' });
    setMisionAbierta(null);
    setExitoId(null);
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
    setMisionAbierta(null);
  }

  function abrirFormulario(id: string) {
    setMisionAbierta(id);
    setCombustible('');
    setErrorCampo(null);
    setErrorConexion(false);
    setExitoId(null);
  }

  function cancelar() {
    setMisionAbierta(null);
    setCombustible('');
    setErrorCampo(null);
    setErrorConexion(false);
  }

  async function confirmar(misionId: string) {
    const resultado = validarCombustible(combustible);
    if (!resultado.ok) {
      setErrorCampo(resultado.error);
      setErrorConexion(false);
      return;
    }

    setErrorCampo(null);
    setGuardando(true);
    setErrorConexion(false);
    try {
      const nave = await misionesService.completar(misionId, resultado.valor);
      setEstado((actual) =>
        actual.fase === 'listo'
          ? {
              fase: 'listo',
              misiones: actual.misiones.map((m) =>
                m.id === misionId ? { ...m, estado: 'completada' } : m,
              ),
            }
          : actual,
      );
      setMisionAbierta(null);
      setCombustible('');
      setExitoId(misionId);
      onNaveActualizada(nave);
    } catch {
      setErrorConexion(true);
    } finally {
      setGuardando(false);
    }
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
          {estado.misiones.map((mision) => {
            const completar = puedeCompletar(mision, hoy);
            const formularioAbierto = misionAbierta === mision.id;
            const otraAbierta = misionAbierta !== null && !formularioAbierto;

            return (
              <li key={mision.id} className="item-mision">
                <div className="mision-cabecera">
                  <span className="mision-destino">{mision.destino}</span>
                  <span className="mision-fecha">
                    {describirFechaDespegue(mision.fechaDespegue, hoy)}
                  </span>
                  <span className="mision-duracion">{describirDuracion(mision.duracionDias)}</span>
                  {mision.estado === 'completada' && (
                    <span className="insignia mision-insignia">Completada</span>
                  )}
                  {completar && !formularioAbierto && (
                    <button
                      type="button"
                      className="boton boton--secundario"
                      disabled={otraAbierta || guardando}
                      onClick={() => abrirFormulario(mision.id)}
                    >
                      Completar
                    </button>
                  )}
                </div>

                {formularioAbierto && (
                  <form
                    className="formulario-completar"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void confirmar(mision.id);
                    }}
                  >
                    <div className="campo">
                      <label htmlFor={`combustible-restante-${mision.id}`}>Combustible restante</label>
                      <input
                        id={`combustible-restante-${mision.id}`}
                        className="campo-control"
                        value={combustible}
                        onChange={(e) => setCombustible(e.target.value)}
                        aria-invalid={errorCampo ? true : undefined}
                        aria-describedby={errorCampo ? `combustible-restante-${mision.id}-error` : undefined}
                        disabled={guardando}
                      />
                      {errorCampo && (
                        <p id={`combustible-restante-${mision.id}-error`} className="campo-error">
                          {errorCampo}
                        </p>
                      )}
                    </div>
                    <div className="formulario-completar-acciones">
                      <button
                        type="submit"
                        className="boton boton--primario boton--confirmar"
                        disabled={guardando}
                      >
                        {guardando ? 'Guardando…' : 'Confirmar'}
                      </button>
                      <button
                        type="button"
                        className="boton boton--secundario"
                        disabled={guardando}
                        onClick={cancelar}
                      >
                        Cancelar
                      </button>
                    </div>
                    {errorConexion && (
                      <p className="aviso aviso--error" role="alert">
                        No se pudo completar la misión.
                      </p>
                    )}
                  </form>
                )}

                {exitoId === mision.id && (
                  <p className="aviso aviso--exito" role="status">
                    Misión completada.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
