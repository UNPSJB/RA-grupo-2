import { Link } from "react-router-dom";
import ROUTES from "../../paths";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  const role = currentUser?.role_name;
  const userName = currentUser?.username || "Usuario";
  const userRoleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : "Invitado";

  // Detectar scroll para cambiar la densidad del vidrio
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
  };

  // Lógica de enlaces rápidos (Replicada para el Dropdown)



  return (
    <nav
      className={`navbar fixed-top transition-all duration-300`}
      style={{
        padding: scrolled ? '0.75rem 1.5rem' : '1.25rem 2rem',
        transition: 'all 0.4s ease',
        zIndex: 1040,
      }}
    >
      <div 
        className="container-fluid glass-panel rounded-4 px-4 py-2 d-flex justify-content-between align-items-center position-relative"
        style={{
          boxShadow: scrolled ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
          background: scrolled ? 'var(--color-surface-glass)' : 'rgba(255,255,255,0.6)',
        }}
      >
        {/* BRANDING */}
        <Link
          className="navbar-brand d-flex align-items-center gap-3"
          to={ROUTES.HOME}
        >
          <div className="position-relative">
            <div 
              className="position-absolute top-50 start-50 translate-middle"
              style={{
                width: '40px', height: '40px',
                background: 'var(--color-brand-primary)',
                filter: 'blur(15px)', opacity: 0.3, zIndex: -1
              }}
            />
            <img
              src="/unpsjb-logo.png"
              alt="Logo UNPSJB"
              style={{ height: '42px', objectFit: 'contain' }}
            />
          </div>
          
          <div className="d-flex flex-column lh-1">
            <span 
              className="fw-bold text-gradient" 
              style={{ fontSize: '1.2rem', letterSpacing: '-0.5px' }}
            >
              Sistema de Encuestas
            </span>
            <span 
              style={{ 
                fontSize: '0.75rem', 
                color: 'var(--color-text-secondary)',
                fontWeight: 500,
                letterSpacing: '0.5px'
              }}
            >
              Universidad Nacional de la Patagonia San Juan Bosco
            </span>
          </div>
        </Link>

        {/* USER CAPSULE */}
        <div className="navbar-nav ms-auto">
          <li className="nav-item dropdown position-relative">
            <a
              className="nav-link d-flex align-items-center gap-3 ps-1 pe-3 py-1 rounded-pill"
              href="#"
              id="userDropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ 
                background: 'rgba(var(--color-surface), 0.5)',
                border: '1px solid var(--color-border)',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-brand-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
            >
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center text-white shadow-sm"
                style={{ 
                  width: '38px', 
                  height: '38px', 
                  background: 'var(--gradient-primary)',
                  fontSize: '0.9rem'
                }}
              >
                {userName.charAt(0).toUpperCase()}
              </div>
              
              <div className="d-none d-md-flex flex-column align-items-start">
                <span className="fw-bold" style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                  {userName}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-brand-primary)' }}>
                  {userRoleLabel}
                </span>
              </div>

              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="ms-2 text-muted" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
              </svg>
            </a>

            <ul 
              className="dropdown-menu dropdown-menu-end mt-3 border-0 shadow-lg p-0 rounded-4 overflow-hidden" 
              aria-labelledby="userDropdown"
              style={{ 
                minWidth: '240px', 
                background: 'var(--color-surface)',
                position: 'absolute',
                right: 0,
                maxHeight: '80vh',
                overflowY: 'auto'
              }}
            >
              {/* Header */}
              

              {/* Quick Links Section */}
              

              {/* Actions */}
              <li>
                <a className="dropdown-item px-3 py-2 d-flex align-items-center gap-2 text-danger fw-medium" href="#" onClick={handleLogout}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/></svg>
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