import { Link } from "react-router-dom";
import ROUTES from "../../paths"; 
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { currentUser, logout } = useAuth();

  const role = currentUser?.role_name;
  const userName = currentUser?.username || "Usuario";
  const userRoleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : "Invitado";

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault(); 
    logout(); 
  };
  const navbarStyle = {
    backgroundColor: 'var(--color-background-primary)', 
    color: 'var(--color-text-primary)',               
    padding: '0.5rem 1rem',
    borderBottom: '5px solid var(--color-unpsjb-border)',
  };
  
  const dropdownMenuStyle = {
    backgroundColor: 'var(--color-dropdown-bg)', 
    border: '1px solid var(--color-unpsjb-border)', 
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
  };

  const userDropdownMenuStyle = {
    ...dropdownMenuStyle,
    right: 0, 
    left: 'auto', 
    minWidth: '220px',
  };

  return (
    <nav 
      className="navbar navbar-expand shadow-sm fixed-top" 
      style={{...navbarStyle, zIndex: 1040}} 
    >
      <div className="container-fluid d-flex justify-content-between align-items-center">
        
        <Link 
          className="navbar-brand d-flex align-items-center"
          to={ROUTES.HOME} 
          style={{ color: 'var(--color-text-primary)', textDecoration: 'none' }} 
        >
          <img 
            src="/unpsjb-logo.png" 
            alt="Logo UNPSJB"
            style={{ height: '50px', marginRight: '10px', filter: 'drop-shadow(0 0 5px rgba(0, 0, 0, 0.3))' }} 
          />
          <div className="d-flex flex-column align-items-start">
            <span className="fw-bold" style={{ fontSize: '1.1rem', lineHeight: '1.2' }}>Sistema de encuestas</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Universidad Nacional de la Patagonia San Juan Bosco</span>
          </div>
        </Link>

        <div className="navbar-nav"> 
          <li className="nav-item dropdown"> 
            <a 
              className="nav-link nav-link-animated d-flex align-items-center" 
              href="#" 
              id="userDropdown" 
              role="button" 
              data-bs-toggle="dropdown" 
              aria-expanded="false"
              style={{ padding: '0.5rem' }} 
            >
              <div className="d-none d-md-flex flex-column align-items-end me-3">
                  <span className="fw-bold" style={{ color: 'var(--color-text-primary)', fontSize: '0.9rem' }}>{userName}</span>
                  <span className="text-muted" style={{ color: 'var(--color-text-primary)', fontSize: '0.75rem', opacity: 0.7 }}>{userRoleLabel}</span>
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
                  <a className="dropdown-item" href="#" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                    Cerrar Sesión
                  </a>
              </li>
            </ul>
          </li>
        </div>

      </div>
    </nav>
  );
}