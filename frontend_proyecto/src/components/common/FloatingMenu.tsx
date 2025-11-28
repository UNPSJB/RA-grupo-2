import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ROUTES from "../../paths";
import { getRoleLinks } from "../../config/navigationParams";

// Íconos actualizados con un estilo más consistente
const Icons = {
  Menu: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>,
  Close: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  Drag: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="12" r="1" /><circle cx="9" cy="5" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="19" r="1" /></svg>,
  // Usamos ChevronRight para un look más moderno de "ir a"
  Arrow: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
};

export default function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  
  // LÓGICA DE ARRASTRE (Sin cambios)
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialPos = useRef({ x: 0, y: 0 });

  const { currentUser } = useAuth();
  const location = useLocation();

  if (location.pathname === ROUTES.LOGIN || location.pathname === ROUTES.HOME) return null;

  const role = currentUser?.role_name || 'Invitado';
  const allLinks = getRoleLinks(role);
  const availableLinks = allLinks.filter(link => link.to !== location.pathname);

  if (availableLinks.length === 0) return null;

  // --- HANDLERS DE ARRASTRE (Sin cambios) ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isDragging.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY };
    initialPos.current = { ...position };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      isDragging.current = true;
      setPosition({
        x: initialPos.current.x + dx,
        y: initialPos.current.y + dy
      });
    }
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    setIsOpen(!isOpen);
  };

  return (
    <div 
      className={`draggable-widget ${isOpen ? 'open' : ''}`}
      style={{ 
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging.current ? 'grabbing' : 'grab' 
      }}
      onMouseDown={handleMouseDown}
    >
      
      {/* MENÚ (Aparece arriba) */}
      <div className="widget-menu">
        {availableLinks.map((link, index) => (
            <Link 
              key={index} 
              to={link.to} 
              className="widget-link"
              // --- AQUÍ ESTÁ LA MAGIA DE LA CASCADA ---
              style={{ 
                // Retraso base de 0.05s + 0.07s por cada ítem subsiguiente
                animationDelay: `${0.05 + index * 0.07}s` 
              }}
              onClick={(e) => {
                  e.stopPropagation(); 
                  setIsOpen(false);
              }}
            >
              <span>{link.title}</span>
              {/* Clase auxiliar para animar la flecha */}
              <span className="link-arrow"><Icons.Arrow /></span>
            </Link>
        ))}
      </div>

      {/* BOTÓN TRIGGER (Sin cambios mayores, solo iconos actualizados) */}
      <div 
        className="widget-trigger"
        onClick={handleClick}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.5px' }}>
                {isOpen ? 'Cerrar' : 'Acciones'}
            </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isOpen ? <Icons.Close /> : <Icons.Menu />}
            <div className="drag-handle" title="Arrastrar para mover">
                <Icons.Drag />
            </div>
        </div>
      </div>

    </div>
  );
}