import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ANIO_ACTUAL, PERIODO_ACTUAL } from "../../constants";
import MensajeExito from "../pregunta/preguntaCerrada/MensajeExito";
import ROUTES from "../../paths";
import api from "../../services/api";

type EncuestaDisponible = {
  materia: string;
  encuesta: string;
  materia_id: number;
  encuesta_id: number;
};

type Props = {
  encuestas: EncuestaDisponible[];
  alumnoId: number;
};

export default function EncuestasDisponibles({ encuestas, alumnoId }: Props) {
  const navigate = useNavigate();
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const [filtroMateria, setFiltroMateria] = useState<string>("");
  const [filtroEncuesta, setFiltroEncuesta] = useState<string>("");

  const opciones = useMemo(() => {
    const materias = Array.from(new Set(encuestas.map(e => e.materia))).sort();
    const tiposEncuesta = Array.from(new Set(encuestas.map(e => e.encuesta))).sort();
    return { materias, tiposEncuesta };
  }, [encuestas]);

  const encuestasFiltradas = useMemo(() => {
    return encuestas.filter(e => {
      const matchMateria = filtroMateria ? e.materia === filtroMateria : true;
      const matchEncuesta = filtroEncuesta ? e.encuesta === filtroEncuesta : true;
      return matchMateria && matchEncuesta;
    });
  }, [encuestas, filtroMateria, filtroEncuesta]);

  const limpiarFiltros = () => {
    setFiltroMateria("");
    setFiltroEncuesta("");
  };

  const verificarYCompletar = async (e: EncuestaDisponible) => {
    try {
      const response = await api.get(`/encuesta-completada/existe`, {
        params: {
          alumno_id: alumnoId,
          encuesta_id: e.encuesta_id,
          materia_id: e.materia_id,
          anio: ANIO_ACTUAL,
          periodo: PERIODO_ACTUAL
        }
      });
      const data = response.data;

      if (data.existe) {
        setMensajeExito(`Ya completaste la encuesta de ${e.materia}`);
      } else {
        navigate(ROUTES.COMPLETAR_ENCUESTA, {
          state: {
            alumnoId: alumnoId,
            encuestaId: e.encuesta_id,
            materiaId: e.materia_id,
            nombreMateria: e.materia
          }
        });
      }
    } catch (error) {
      console.error("Error al verificar encuesta:", error);
      setMensajeExito("Error al verificar la encuesta");
    }
  };

  const cerrarMensaje = () => {
    setMensajeExito(null);
  };

  if (mensajeExito) {
    return (
      <MensajeExito
        mensaje={mensajeExito}
        onClose={cerrarMensaje}
      />
    );
  }

  return (
    <div>
      <div className="d-flex flex-wrap align-items-center justify-content-between bg-light p-3 rounded-3 mb-4 border">
        <div className="d-flex flex-wrap align-items-center gap-4">
          
          <div className="d-flex align-items-center">
            <label className="text-muted fw-bold small me-2 text-uppercase" style={{ fontSize: '0.75rem' }}>Materia:</label>
            <select
              className="form-select form-select-sm border-0 bg-white shadow-sm"
              style={{ maxWidth: '250px', cursor: 'pointer' }}
              value={filtroMateria}
              onChange={(e) => setFiltroMateria(e.target.value)}
              disabled={opciones.materias.length === 0}
            >
              <option value="">Todos</option>
              {opciones.materias.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="d-flex align-items-center">
            <label className="text-muted fw-bold small me-2 text-uppercase" style={{ fontSize: '0.75rem' }}>Tipo / Ciclo:</label>
            <select
              className="form-select form-select-sm border-0 bg-white shadow-sm"
              style={{ width: 'auto', cursor: 'pointer' }}
              value={filtroEncuesta}
              onChange={(e) => setFiltroEncuesta(e.target.value)}
              disabled={opciones.tiposEncuesta.length === 0}
            >
              <option value="">Todos</option>
              {opciones.tiposEncuesta.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {(filtroMateria || filtroEncuesta) && (
            <button onClick={limpiarFiltros} className="btn btn-link text-danger p-0">
              <i className="bi bi-x-circle-fill"></i>
            </button>
          )}
        </div>

        <div className="text-end mt-2 mt-md-0">
          <span className="text-muted fw-bold small text-uppercase" style={{ fontSize: '0.75rem' }}>DISPONIBLES:</span>
          <span className="ms-2 fs-5 fw-bold text-primary">{encuestasFiltradas.length}</span>
        </div>
      </div>

      {encuestasFiltradas.length === 0 ? (
        <div className="alert alert-info text-center">
          {encuestas.length === 0 ? "No hay encuestas pendientes" : "No hay encuestas con los filtros seleccionados"}
        </div>
      ) : (
        <div className="list-group">
          {encuestasFiltradas.map((e, i) => (
            <div key={i} className="col-12 mb-3">
              <div className="card">
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted me-2">{i + 1}.</span>
                    <span className="fw-bold">
                      <span>{e.materia}</span>
                    </span>
                    <span className="text-muted ms-2 small"> — {e.encuesta} </span>
                  </div>
                  <button onClick={() => verificarYCompletar(e)}
                    className="btn btn-theme-primary rounded-pill px-6"
                  >
                    Completar Encuesta
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}