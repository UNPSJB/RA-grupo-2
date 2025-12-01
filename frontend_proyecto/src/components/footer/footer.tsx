import { useState } from "react";

export default function Footer() {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleFooter = () => setIsExpanded(!isExpanded);

  return (
    <>
      <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
        <defs>
          <filter id="flag-wave-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.02 0.005" 
              numOctaves="2" 
              result="ripple" 
            >
               <animate 
                 attributeName="baseFrequency" 
                 dur="12s" 
                 values="0.02 0.005; 0.025 0.009; 0.015 0.006; 0.02 0.005" 
                 repeatCount="indefinite" 
               />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="ripple" scale="10" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      <style>
        {`
          @keyframes gentleSway {
            0%, 100% { transform: rotate(-1.5deg) translateY(0px); }
            50% { transform: rotate(1.5deg) translateY(-2px); }
          }

          .real-flag-effect {
            filter: url(#flag-wave-filter);
            animation: gentleSway 6s ease-in-out infinite;
            transform-origin: left center;
            filter: url(#flag-wave-filter) drop-shadow(2px 4px 6px rgba(0,0,0,0.15));
            will-change: transform;
          }

          .real-flag-effect:hover {
            animation-play-state: paused;
          }
        `}
      </style>

      {/* Spacer */}
      <div style={{ height: isExpanded ? '320px' : '60px', transition: 'height 0.4s ease' }} />

      <footer 
        className="fixed-bottom glass-panel border-0"
        style={{
          boxShadow: 'var(--shadow-lg)', 
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
                  <small style={{fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    Universidad Nacional de la Patagonia San Juan Bosco
                  </small>
                </div>
                <p className="small mb-0 mt-2" style={{ maxWidth: '350px', color: 'var(--color-text-secondary)' }}>
                  Acá va a ir una breve información
                </p>
              </div>

              {/* Column 2: Center Logo */}
              <div className="col-md-4 text-center">
                <img 
                  src="/chubut.svg" 
                  alt="Logo CHUBUT flameando"
                  className="real-flag-effect" 
                  style={{
                    height: '85px', 
                    width: 'auto',
                    objectFit: 'contain',
                    padding: '5px' 
                  }}
                />
              </div>

              {/* Column 3: Contact */}
              <div className="col-md-4 text-center text-md-end">
                <h6 className="fw-bold text-uppercase mb-3 small ls-1" style={{color: 'var(--color-brand-primary)'}}>
                  Información de Contacto
                </h6>
                <div className="d-flex flex-column gap-2 align-items-center align-items-md-end">
                  <div className="d-flex align-items-center gap-2 small" style={{ color: 'var(--color-text-secondary)' }}>
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/></svg>
                    9 de Julio 25, U9100 Trelew, Chubut
                  </div>

                  <div className="d-flex align-items-center gap-2 small" style={{ color: 'var(--color-text-secondary)' }}>
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/></svg>
                    +54 (280) 442-1080
                  </div>

                  <div className="d-flex align-items-center gap-2 small" style={{ color: 'var(--color-text-secondary)' }}>
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555ZM0 4.697v7.104l5.803-3.558L0 4.697ZM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586l-1.239-.757Zm3.436-.586L16 11.801V4.697l-5.803 3.546Z"/></svg>
                    info@unpsjb.edu.ar
                  </div>
                </div>
              </div>

            </div>
          </div>
          
          {/* Bottom Bar */}
          <div 
            className="py-2" 
            style={{ 
              background: 'var(--color-brand-light)', 
              borderTop: '1px solid var(--color-border)' 
            }}
          >
            <div className="container text-center">
              <span className="small" style={{fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                &copy; {new Date().getFullYear()} UNPSJB - Todos los derechos reservados.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}