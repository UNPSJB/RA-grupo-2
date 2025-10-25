import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/">
          Sistema de encuestas
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">

            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="alumnoDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Alumno
              </a>
              <ul className="dropdown-menu" aria-labelledby="alumnoDropdown">
                <li>
                  <Link className="dropdown-item" to="/encuestas">
                    Encuestas Disponibles
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/encuestas-completadas">
                    Encuestas Completadas
                  </Link>
                </li>
              </ul>
            </li>

            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="docenteDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Docente
              </a>
              <ul className="dropdown-menu" aria-labelledby="docenteDropdown">
                <li>
                  <Link className="dropdown-item" to="/docentes/1">
                    Materias dadas
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/docentes/informes-pendientes">
                    Informes de Cátedra Pendientes
                  </Link>
                </li>
              </ul>
            </li>

            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="departamentoDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Departamento
              </a>
              <ul
                className="dropdown-menu"
                aria-labelledby="departamentoDropdown"
              >
                <li>
                  <Link className="dropdown-item" to="/departamento">
                    Carreras
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/informes-catedra">
                    Informes de Cátedra Completados
                  </Link>
                </li>
              </ul>
            </li>

            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="secretariaDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Secretaría Académica
              </a>
              <ul className="dropdown-menu" aria-labelledby="secretariaDropdown">
                <li>
                  <Link className="dropdown-item" to="/informes">
                    Informes Sintéticos
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/informes-catedra-base">
                    Crear Informe de Cátedra Base
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/encuestas/nueva">
                    Crear Encuesta Base
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}