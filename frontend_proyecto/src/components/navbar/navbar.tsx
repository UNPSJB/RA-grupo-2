import { Link } from "react-router-dom";
import ROUTES from "../../paths"; 

export default function Navbar() {
  
  const navbarStyle = {
    backgroundColor: 'var(--color-background-primary)', 
    color: 'var(--color-text-primary)',               
    padding: '0.2rem 1rem',
    borderBottom: '5px solid var(--color-unpsjb-border)',
  };
  
  const dropdownMenuStyle = {
    backgroundColor: 'var(--color-dropdown-bg)', 
    border: '1px solid var(--color-unpsjb-border)', 
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
  };

  const navLinkStyle = {
    fontSize: '1.15rem', 
    color: 'var(--color-text-primary)', 
  };

  return (
    <nav 
      className="navbar navbar-expand-lg shadow-sm" 
      style={navbarStyle} 
    >
      <div className="container-fluid">
        <Link 
          className="navbar-brand fw-bold d-flex align-items-center me-4" 
          to={ROUTES.HOME} 
          style={{ color: 'var(--color-text-primary)', fontSize: '1.5rem' }} 
        >
          <img 
            src="/unpsjb-logo.png" 
            alt="Logo UNPSJB"
            style={{ height: '80px', marginRight: '12px', filter: 'drop-shadow(0 0 5px rgba(0, 0, 0, 0.3))' }} 
          />
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
                className="nav-link dropdown-toggle nav-link-animated" 
                href="#" 
                id="alumnoDropdown" 
                role="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
                style={navLinkStyle}
              >
                Alumno
              </a>
              <ul className="dropdown-menu custom-dropdown" aria-labelledby="alumnoDropdown" style={dropdownMenuStyle}>
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
                className="nav-link dropdown-toggle nav-link-animated" 
                href="#" 
                id="docenteDropdown" 
                role="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
                style={navLinkStyle}
              >
                Docente
              </a>
              <ul className="dropdown-menu custom-dropdown" aria-labelledby="docenteDropdown" style={dropdownMenuStyle}>
                <li>
                    <Link className="dropdown-item" to={ROUTES.MATERIAS_ASIGNADAS(1)}> 
                        Materias dadas
                    </Link>
                </li>
                <li>
                    <Link className="dropdown-item" to={ROUTES.INFORMES_CATEDRA_PENDIENTES}> 
                    </Link>
                </li>
              </ul>
            </li>
            <li className="nav-item dropdown">
              <a 
                className="nav-link dropdown-toggle nav-link-animated" 
                href="#" 
                id="departamentoDropdown" 
                role="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
                style={navLinkStyle}
              >
                Departamento
              </a>
              <ul className="dropdown-menu custom-dropdown" aria-labelledby="departamentoDropdown" style={dropdownMenuStyle}>
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
                className="nav-link dropdown-toggle nav-link-animated" 
                href="#" 
                id="secretariaDropdown" 
                role="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
                style={navLinkStyle}
              >
                Secretaría Académica
              </a>
              <ul className="dropdown-menu custom-dropdown" aria-labelledby="secretariaDropdown" style={dropdownMenuStyle}>
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