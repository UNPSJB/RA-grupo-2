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

  const userDropdownMenuStyle = {
    ...dropdownMenuStyle,
    right: 0, 
    left: 'auto', 
    minWidth: '220px',
  };
  const userName = "Juan Pérez";
  const userRole = "Docente";

  return (
    <nav 
      className="navbar navbar-expand-lg shadow-sm" 
      style={navbarStyle} 
    >
      <div className="container-fluid">
        <Link 
          className="navbar-brand d-flex align-items-center me-5"
          to={ROUTES.HOME} 
          style={{ color: 'var(--color-text-primary)' }} 
        >
          <img 
            src="/unpsjb-logo.png" 
            alt="Logo UNPSJB"
            style={{ height: '70px', marginRight: '12px', filter: 'drop-shadow(0 0 5px rgba(0, 0, 0, 0.3))' }} 
          />
          <div className="d-flex flex-column align-items-start">
            <span className="fw-bold" style={{ fontSize: '1.2rem' }}>Sistema de encuestas</span>
            <span style={{ fontSize: '0.75rem', marginTop: '-3px', opacity: 0.8 }}>Universidad Nacional Pública San Juan Bosco</span>
          </div>
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
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0"> 
            
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
                <li><Link className="dropdown-item" to={ROUTES.ENCUESTAS_DISPONIBLES}>Encuestas Disponibles</Link></li>
                <li><Link className="dropdown-item" to={ROUTES.ENCUESTAS_COMPLETADAS}>Encuestas Completadas</Link></li>
              </ul>
            </li>
            
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
                    Informes de Cátedra Pendientes
                  </Link>
                </li>
                <li>  
                  <Link className="dropdown-item" to={ROUTES.INFORMES_CATEDRA_COMPLETADOS}>
                    Informes de Cátedra Completados
                  </Link>
                </li>
              </ul>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle nav-link-animated" href="#" id="departamentoDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" style={navLinkStyle}>Departamento</a>
              <ul className="dropdown-menu custom-dropdown" aria-labelledby="departamentoDropdown" style={dropdownMenuStyle}>
                <li><Link className="dropdown-item" to={ROUTES.CARRERAS_DPTO(1)}>Informes Sinteticos Pendientes</Link></li>
                <li><Link className="dropdown-item" to={ROUTES.INFORMES_CATEDRA}>Informes de Cátedra Completados</Link></li>
              </ul>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle nav-link-animated" href="#" id="secretariaDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" style={navLinkStyle}>Secretaría Académica</a>
              <ul className="dropdown-menu custom-dropdown" aria-labelledby="secretariaDropdown" style={dropdownMenuStyle}>
                <li><Link className="dropdown-item" to={ROUTES.INFORMES_SINTETICOS}>Informes Sintéticos</Link></li>
                <li><Link className="dropdown-item" to={ROUTES.INFORME_CATEDRA_BASE_NUEVO}>Crear Informe de Cátedra</Link></li>
                <li><Link className="dropdown-item" to={ROUTES.INFORME_SINTETICO_BASE_NUEVO}>Crear Informe Sintético Base</Link></li>
                <li><Link className="dropdown-item" to={ROUTES.ENCUESTA_BASE_NUEVA}>Crear Encuesta Base</Link></li>
                <li><Link className="dropdown-item" to={ROUTES.ASIGNAR_MATERIA_INFORME}>Asignar Formularios a Materias</Link></li>
              </ul>
            </li>        
          </ul>
        </div>
        <div className="navbar-nav ms-auto"> 
          <li className="nav-item dropdown d-none d-lg-block"> 
            
            <a 
              className="nav-link nav-link-animated d-flex align-items-center" 
              href="#" 
              id="userDropdown" 
              role="button" 
              data-bs-toggle="dropdown" 
              aria-expanded="false"
              style={{ padding: '0.5rem 0.5rem' }} 
            >
              <div className="d-flex flex-column align-items-end me-3">
                  <span className="fw-bold" style={{ color: 'var(--color-text-primary)', fontSize: '1.0rem' }}>{userName}</span>
                  <span className="text-muted" style={{ color: 'var(--color-text-primary)', fontSize: '0.75rem', opacity: 0.7 }}>{userRole}</span>
              </div>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="32" 
                height="32" 
                fill="currentColor" 
                className="user-icon-svg" 
                viewBox="0 0 16 16"
                style={{ color: 'var(--color-text-primary)' }} 
              >
                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
              </svg>
              
            </a>
            
            <ul className="dropdown-menu custom-dropdown user-dropdown-menu" aria-labelledby="userDropdown" style={userDropdownMenuStyle}>
              <li>
                  Cerrar Sesión
              </li>
            </ul>
          </li>
        </div>
      </div>
    </nav>
  );
}