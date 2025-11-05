import {useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'; 

export default function Footer() {
  const [isExpanded, setIsExpanded] = useState(true);
  const MINIMIZED_HEIGHT_BASE = 50;
  const EXPANDED_HEIGHT = 500; 
  const totalFooterHeight = isExpanded ? (MINIMIZED_HEIGHT_BASE + 90) : MINIMIZED_HEIGHT_BASE;
  const footerContentMaxHeight = isExpanded ? EXPANDED_HEIGHT : 0; 

  const footerStyle = {
    backgroundColor: 'var(--color-background-primary)', 
    color: 'var(--color-text-primary)',               
    borderTop: '5px solid var(--color-unpsjb-border)', 
    height: `${totalFooterHeight}px`, 
    transition: 'height 0.3s ease-in-out', 
  };
  
  const iconColor = 'var(--color-text-primary)'; 
  
  return (
    <footer 
      className="p-0" 
      style={footerStyle}
    >
      <div className="container">
        <div className="row" style={{ paddingTop: '0.2rem', paddingBottom: '0.2rem' }}>
            <div className="col text-center m-0 p-0"> 
                <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => setIsExpanded(!isExpanded)} 
                    style={{ color: iconColor, backgroundColor: 'transparent', border: 'none', padding: '0 0.5rem' }} 
                >
                    <FontAwesomeIcon 
                        icon={isExpanded ? faChevronDown : faChevronUp} 
                        style={{ fontSize: '0.9rem' }} 
                    />
                </button>
            </div>
        </div>
        <div 
          className="collapse-content"
          style={{ 
              maxHeight: `${footerContentMaxHeight}px`, 
              overflow: 'hidden',
              paddingTop: isExpanded ? '0.5rem' : '0', 
              transition: 'max-height 0.3s ease-in-out, padding-top 0.3s ease-in-out'
          }}
        >
            <div className="row d-flex align-items-center pb-2 border-bottom">
                <div className="col-md-7 mb-2 mb-md-0">
                    <p className="mb-0 fw-bold" style={{ fontSize: '0.9rem', color: iconColor }}>
                        UNPSJB
                    </p>
                    <p className="mb-0" style={{ fontSize: '0.8rem', color: iconColor }}>
                        9 de Julio 25, U9100 Trelew, Chubut
                    </p>
                </div>
                
                <div className="col-md-5 text-md-end">
                    <p className="mb-1" style={{ fontSize: '0.9rem', color: iconColor }}>
                        Tel: +54 (280) 442-1080
                    </p>
                    <p className="mb-0" style={{ fontSize: '0.9rem', color: iconColor }}>
                        Email: info@unpsjb.edu.ar
                    </p>
                </div>
            </div>
            <div className="row pt-2">
                <div className="col text-center">
                    <p className="mb-0" style={{ fontSize: '0.8rem', color: iconColor }}>
                        © 2025 Todos los derechos reservados
                    </p>
                </div>
            </div>
        </div>
      </div>
    </footer>
  );
}