import { Link } from "react-router-dom";

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
  if (encuestas.length === 0) {
    return (
      <div className="alert alert-info text-center">
        No hay carreras disponibles
      </div>
    );
  }

  return (
    <div className="list-group">
      {encuestas.map((e, i) => (
        <div key={i} className="col-12 mb-3">
          <div className="card">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted me-3">{i + 1}.</span>
                <span className="fw-bold">
                  <strong>{e.materia}</strong> — {e.encuesta}{" "}
                </span>
              </div>
              <Link to={`/encuestas/categoria-b/`}
                state={{
                  alumnoId: alumnoId,
                  encuestaId: e.encuesta_id,
                  materiaId: e.materia_id,
                  nombreMateria: e.materia
                }}                
                className="btn btn-primary btn-sm"
              >
                Completar Encuesta
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
