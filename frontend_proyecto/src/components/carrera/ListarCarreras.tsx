import type { Carrera } from "../../types/types";
import { Link } from "react-router-dom";

type Props = {
  carreras: Carrera[];
};

function ListaCarreras({ carreras }: Props) {
  if (!carreras || carreras.length === 0) {
    return <div className="alert alert-info text-center">No hay carreras disponibles</div>;
  }

  return (
    <div className="list-group">
      {carreras.map((carrera, index) => (
        <div key={carrera.id} className="col-12 mb-3">
          <div className="card">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted me-3">{index + 1}.</span>
                <span className="fw-bold">{carrera.nombre}</span>
              </div>
              <Link
                to={`/carrera/${carrera.id}`}
                state={{ nombre: carrera.nombre }}
                className="btn btn-primary btn-sm"          
              >
                Completar Informe
              </Link>
            </div>
          </div>   
        </div>
      ))}
    </div>
  );
}

export default ListaCarreras;