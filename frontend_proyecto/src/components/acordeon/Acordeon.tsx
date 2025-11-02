import { useState, useRef } from 'react';
import type { ReactNode } from 'react';

interface AcordeonProps {
  titulo: ReactNode;
  contenido: ReactNode;
  startOpen?: boolean;
}

export default function Acordeon({ titulo, contenido, startOpen = false }: AcordeonProps) {
  const [estaAbierto, setEstaAbierto] = useState(startOpen);
  const elRef = useRef<HTMLDivElement>(null);

  const alHacerClic = () => {
    const estabaCerrado = !estaAbierto;
    
    setEstaAbierto(!estaAbierto);

    if (estabaCerrado) {
      setTimeout(() => {
        if (elRef.current) {
          elRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
          });
        }
      }, 100);
    }
  };

  const btnClass = `accordion-button shadow-none ${estaAbierto ? '' : 'collapsed'}`;
  const contentClass = `accordion-collapse collapse ${estaAbierto ? 'show' : ''}`;

  return (
    <div className="accordion-item mb-3 shadow-sm" ref={elRef}>
      <h2 className="accordion-header">
        <button 
          className={btnClass}
          type="button" 
          onClick={alHacerClic}
          aria-expanded={estaAbierto}
          style={{ boxShadow: 'none', outline: 'none' }}
        >
          {titulo}
        </button>
      </h2>

      <div className={contentClass}>
        <div className="accordion-body">
          {contenido}
        </div>
      </div>
    </div>
  );
}