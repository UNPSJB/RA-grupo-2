import { Link } from "react-router-dom";

export default function Menu() {
  return (
    <div>
      <h1>Menú principal</h1>
      <div>
        <Link to="/encuestas">
          <button>Ir a Encuestas</button>
        </Link>
        <Link to="/docentes/1">
          <button>Ir a Docentes</button>
        </Link>
        <Link to="/departamento">
          <button>Ir a Carreras</button>
        </Link>
        <Link to="/informes">
          <button>Ir a Informes Sintéticos</button>
        </Link>
      </div>
    </div>
  );
}
