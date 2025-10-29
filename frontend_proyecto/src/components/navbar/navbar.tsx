import { Link } from "react-router-dom";
import ROUTES from "../../paths";

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to={ROUTES.HOME}>
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
                  <Link className="dropdown-item" to={ROUTES.ENCUESTAS_DISPONIBLES}>
                    Encuestas Disponibles
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to={ROUTES.ENCUESTAS_COMPLETADAS}>
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
                  <Link className="dropdown-item" to={ROUTES.MATERIAS_ASIGNADAS(1)}>
                    Materias dadas
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to={ROUTES.INFORMES_CATEDRA_PENDIENTES}>
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
                  <Link className="dropdown-item" to={ROUTES.CARRERAS_DPTO}>
                    Carreras
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to={ROUTES.INFORMES_CATEDRA}>
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
                  <Link className="dropdown-item" to={ROUTES.INFORMES_SINTETICOS}>
                    Informes Sintéticos
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to={ROUTES.INFORME_CATEDRA_BASE_NUEVO}>
                    Crear Informe de Cátedra Base
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to={ROUTES.ENCUESTA_BASE_NUEVA}>
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