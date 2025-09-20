import "./carreras.css";
import type { Carrera } from "../../types/types";
import { Link } from "react-router-dom";

type Props = {
  carreras: Carrera[];
};

function ListaCarreras({ carreras }: Props) {
  if (!carreras || carreras.length === 0) {
    return <p className="no-carreras">No hay carreras disponibles</p>;
  }

  return (
    <div className="carreras-list">
      {carreras.map((carrera, index) => (
        <div key={carrera.id} className="carrera-item">
          <span className="carrera-numero">{index + 1}.</span>
          <span className="carrera-nombre">{carrera.nombre}</span>
          <Link 
            to={`/carrera/${carrera.id}`}
            state={{ nombre: carrera.nombre }}
            className="boton-completar"
          >
            Completar Informe
          </Link>

        </div>
      ))}
    </div>
  );
}

export default ListaCarreras;