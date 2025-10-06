import type { Materia } from "../../types/types";
import { Link } from "react-router-dom";
type Props = {
  materias: Materia[] | undefined;
};

export default function ListaMaterias({ materias }: Props) {
  if (!materias || materias.length === 0) {
    return (
      <div className="alert alert-info text-center">
        No hay materias disponibles para este docente
      </div>
    );
  }

  return (
    <div>
      <h2 className="h5 mb-3">Materias asignadas</h2>
      <div className="list-group">
        {materias.map((materia, i) => (
          <div key={materia.id} className="col-12 mb-3">
            <div className="card">
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-muted me-3">{i + 1}.</span>
                  <span className="fw-bold">{materia.nombre}</span>
                  <span className="text-dark"> – {materia.matricula}</span>
                </div>
                <Link
                  to={`/detallemateria/${materia.id}`}
                  state={{ nombre: materia.nombre }}
                  className="btn btn-primary btn-sm"
                >
                  Ver en detalle
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
