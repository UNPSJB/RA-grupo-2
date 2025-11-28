import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ROUTES from "../../paths";
import { getRoleLinks } from "../../config/navigationParams";

// Íconos SVG simples
const Icons = {
  Menu: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>,
  Close: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  Arrow: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
};

export default function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser } = useAuth();
  const location = useLocation();

  // 1. Ocultar en Login y Home
  if (location.pathname === ROUTES.LOGIN || location.pathname === ROUTES.HOME) {
    return null;
  }

  const role = currentUser?.role_name || 'Invitado';
  const allLinks = getRoleLinks(role);

  // 2. FILTRADO: Excluir la ruta actual
  const availableLinks = allLinks.filter(link => link.to !== location.pathname);

  // 3. Si no quedan opciones, ocultar componente
  if (availableLinks.length === 0) return null;

  return (
    <div className="fixed-menu-container">
      {/* Lista de Opciones */}
      <div className={`menu-options ${isOpen ? 'show' : ''}`}>
        
        {availableLinks.map((link, index) => (
            <Link 
              key={index} 
              to={link.to} 
              className="menu-item"
              onClick={() => setIsOpen(false)}
            >
              <span className="item-text">{link.title}</span>
              <span className="item-icon"><Icons.Arrow /></span>
            </Link>
        ))}
      </div>

      {/* Botón Flotante Principal (Trigger) */}
      <button 
        className={`menu-trigger ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir menú rápido"
      >
        {isOpen ? <Icons.Close /> : <Icons.Menu />}
      </button>
    </div>
  );
}