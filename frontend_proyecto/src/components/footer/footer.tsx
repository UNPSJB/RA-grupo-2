import { useState } from "react";

export default function Footer() {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleFooter = () => setIsExpanded(!isExpanded);

  return (
    <>
      {/* Spacer to prevent content overlap */}
      <div style={{ height: isExpanded ? '320px' : '60px', transition: 'height 0.4s ease' }} />

      <footer 
        className="fixed-bottom glass-panel border-0"
        style={{
          boxShadow: '0 -10px 30px rgba(0,0,0,0.1)',
          zIndex: 1030,
          background: 'var(--color-surface-glass)',
          transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        {/* Toggle Button / Handle */}
        <div className="d-flex justify-content-center position-relative">
          <button
            onClick={toggleFooter}
            className="btn border-0 shadow-sm d-flex align-items-center gap-2 px-4 py-2"
            style={{
              position: 'absolute',
              top: '-40px',
              background: 'var(--color-surface)',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
              borderBottom: 'none',
              color: 'var(--color-brand-primary)',
              fontWeight: 600,
              letterSpacing: '0.5px',
              boxShadow: '0 -4px 10px rgba(0,0,0,0.05)'
            }}
          >
            <span style={{ fontSize: '0.8rem' }}>UNPSJB INFO</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" height="16" 
              fill="currentColor" 
              viewBox="0 0 16 16"
              style={{
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.4s ease'
              }}
            >
              <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>

        {/* Expandable Content */}
        <div 
          style={{ 
            maxHeight: isExpanded ? '400px' : '0px',
            opacity: isExpanded ? 1 : 0,
            overflow: 'hidden',
            transition: 'all 0.4s ease',
          }}
        >
          <div className="container-fluid px-5 py-4">
            <div className="row gy-4 align-items-center justify-content-center">

  {/* Column 1: Brand */}
  <div className="col-md-4 text-center text-md-start">
    <div className="lh-1 text-start mb-2">
      <div className="fw-bold h5 mb-0" style={{color: 'var(--color-brand-primary)'}}>UNPSJB</div>
      <small className="text-muted" style={{fontSize: '0.8rem'}}>
        Universidad Nacional de la Patagonia San Juan Bosco
      </small>
    </div>
    <p className="small text-secondary mb-0 mt-2" style={{ maxWidth: '350px' }}>
      Acá va a ir una breve información
    </p>
  </div>

  {/* Column 2: Center Logo */}
  <div className="col-md-4 text-center">
    <img 
      src="/chubut.jpg"
      alt="Logo CHUBUT"
      style={{
        height: '79px',
        width: 'auto',
        objectFit: 'contain',
      }}
    />
  </div>

  {/* Column 3: Contact */}
  <div className="col-md-4 text-center text-md-end">
    <h6 className="fw-bold text-uppercase mb-3 small ls-1" style={{color: 'var(--color-brand-primary)'}}>
      Información de Contacto
    </h6>
    <div className="d-flex flex-column gap-2 align-items-center align-items-md-end">
      <div className="d-flex align-items-center gap-2 text-secondary small">
        <svg width="14" height="14" fill="currentColor"><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/></svg>
        9 de Julio 25, U9100 Trelew, Chubut
      </div>

      <div className="d-flex align-items-center gap-2 text-secondary small">
        <svg width="14" height="14" fill="currentColor"><path d="M3.654 1.328a.678..."/></svg>
        +54 (280) 442-1080
      </div>

      <div className="d-flex align-items-center gap-2 text-secondary small">
        <svg width="14" height="14" fill="currentColor"><path d="M.05 3.555A2 2..."/></svg>
        info@unpsjb.edu.ar
      </div>
    </div>
  </div>

</div>

          </div>
          
          {/* Bottom Bar */}
          <div className="py-2" style={{ background: 'rgba(0,0,0,0.02)', borderTop: '1px solid var(--color-border)' }}>
            <div className="container text-center">
              <span className="small text-muted" style={{fontSize: '0.75rem'}}>&copy; {new Date().getFullYear()} UNPSJB - Todos los derechos reservados.</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}