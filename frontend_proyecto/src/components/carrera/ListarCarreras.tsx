import type { Carrera, Departamento } from "../../types/types";
import { Link } from "react-router-dom";
import ROUTES from "../../paths";
import {ANIO_ACTUAL, PERIODO_ACTUAL} from "../../constants";

type Props = {
  carreras: Carrera[];
  departamento: Departamento;
};

function ListaCarreras({ carreras, departamento }: Props) {
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
                to={ROUTES.COMPLETAR_INFORME_SINTETICO}
                state={{
                  dpto: departamento,
                  carrera: carrera,
                  anio: ANIO_ACTUAL,             
                  periodo: PERIODO_ACTUAL,     
                  informeBaseId: carrera.informe_base_id,
                }}
                className="btn btn-theme-primary rounded-pill px-6"
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