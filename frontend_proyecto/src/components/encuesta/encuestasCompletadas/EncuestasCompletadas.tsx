import { useNavigate } from "react-router-dom";
import type { EncuestaCompletada } from "./ObtenerEncuestasCompletadas";

interface Props {
  encuestas: EncuestaCompletada[];
}

export default function EncuestasCompletadas({ encuestas }: Props) {
  const navigate = useNavigate();

  if (encuestas.length === 0) {
    return <p className="text-muted">No hay encuestas completadas.</p>;
  }

  return (
    <div className="list-group">
      {encuestas.map((e, i) => (
        <div key={i} className="col-12 mb-3">
          <div className="card">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted me-2">{i + 1}.</span>
                <span className="fw-bold text-dark">{e.materia.nombre}</span>
                <span className="text-dark"> — {e.encuesta.nombre}</span>
                <div className="text-secondary small mt-1">
                  Período: {e.anio} - {e.periodo}
                </div>
              </div>

              <button
                onClick={() => navigate(`/encuestas-completadas/${e.id}`)}
                className="btn btn-primary btn-sm"
              >
                Ver respuestas
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
