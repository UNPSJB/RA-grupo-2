import { useState } from "react";

export default function Footer() {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleFooter = () => setIsExpanded(!isExpanded);

  return (
    <>
      {/* =====================================================================
          1. DEFINICIÓN DEL MOTOR DE ANIMACIÓN SVG (Invisible en pantalla)
         Este bloque define el filtro físico que distorsiona los píxeles de la imagen
         para que parezcan tela líquida moviéndose con el viento.
      ===================================================================== */}
      <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
        <defs>
           {/* Definimos el filtro con un ID único */}
          <filter id="flag-wave-filter" x="-20%" y="-20%" width="140%" height="140%">
            {/* feTurbulence: Crea el "ruido" o las arrugas de la tela.
              baseFrequency="0.02 0.005": Ajusta qué tan cerradas son las ondas (horizontal vs vertical).
            */}
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.02 0.005" 
              numOctaves="2" 
              result="ripple" 
            >
               {/* animate: Mueve el ruido para simular el paso del viento */}
               <animate 
                 attributeName="baseFrequency" 
                 dur="12s" /* Duración del ciclo de viento */
                 values="0.02 0.005; 0.025 0.009; 0.015 0.006; 0.02 0.005" 
                 repeatCount="indefinite" 
               />
            </feTurbulence>
            
            {/* feDisplacementMap: Aplica el ruido a la imagen original.
              scale="10": Intensidad de la deformación. Si lo subes, se deforma más.
            */}
            <feDisplacementMap in="SourceGraphic" in2="ripple" scale="10" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* =====================================================================
          2. ESTILOS CSS PARA APLICAR EL FILTRO
      ===================================================================== */}
      <style>
        {`
          /* Animación suave de balanceo global */
          @keyframes gentleSway {
            0%, 100% { transform: rotate(-1.5deg) translateY(0px); }
            50% { transform: rotate(1.5deg) translateY(-2px); }
          }

          .real-flag-effect {
            /* Conectamos la imagen con el filtro SVG definido arriba mediante su ID */
            filter: url(#flag-wave-filter);
            
            /* Aplicamos el balanceo suave global */
            animation: gentleSway 6s ease-in-out infinite;
            
            /* El punto de anclaje es el centro izquierdo (el "mástil") */
            transform-origin: left center;
            
            /* Pequeña sombra para dar volumen */
            filter: url(#flag-wave-filter) drop-shadow(2px 4px 6px rgba(0,0,0,0.15));
            
            /* Optimización de renderizado */
            will-change: transform;
          }

          /* Opcional: Pausar al pasar el mouse */
          .real-flag-effect:hover {
            animation-play-state: paused;
          }
        `}
      </style>


      {/* =====================================================================
          3. ESTRUCTURA DEL COMPONENTE (Tu código original)
      ===================================================================== */}

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

              {/* Column 2: Center Logo (AQUÍ APLICAMOS LA CLASE CSS) */}
              <div className="col-md-4 text-center">
                <img 
                  src="/chubut.svg" // Asegúrate de usar el SVG sin fondo
                  alt="Logo CHUBUT flameando"
                  className="real-flag-effect" // <--- CLASE APLICADA
                  style={{
                    height: '85px', // Un poco más grande para que se note el efecto
                    width: 'auto',
                    objectFit: 'contain',
                    // Un poco de padding ayuda a que las ondas no se corten bruscamente en los bordes
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