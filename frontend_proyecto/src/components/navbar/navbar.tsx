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
      className="navbar navbar-expand-lg shadow-sm fixed-top" 
      style={{...navbarStyle, zIndex: 1040}} 
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
                <li><Link className="dropdown-item" to={ROUTES.INFORMES_SINTETICOS_COMPLETADOS(1)}>Informes Sinteticos Completados</Link></li>
                <li><Link className="dropdown-item" to={ROUTES.INFORMES_CATEDRA}>Informes de Cátedra Completados</Link></li>
              </ul>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle nav-link-animated" href="#" id="secretariaDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" style={navLinkStyle}>Secretaría Académica</a>
              <ul className="dropdown-menu custom-dropdown" aria-labelledby="secretariaDropdown" style={dropdownMenuStyle}>
                <li><Link className="dropdown-item" to={ROUTES.INFORME_CATEDRA_BASE_NUEVO}>Crear Informe de Cátedra Base</Link></li>
                <li><Link className="dropdown-item" to={ROUTES.ENCUESTA_BASE_NUEVA}>Crear Encuesta Base</Link></li>
                <li><Link className="dropdown-item" to={ROUTES.ASIGNAR_MATERIA_INFORME}>Asignar Formularios a Materias</Link></li>
                <li><Link className="dropdown-item" to={ROUTES.DEFINIR_FECHAS}>Definir fechas de apertura y cierre</Link></li>
                <li><Link className="dropdown-item" to={ROUTES.INFORMES_SINTETICOS}>Informes Sintéticos</Link></li>
              </ul>
            </li>        
          </ul>
        </div>
      </div>
    </nav>
  );
}