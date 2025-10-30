import { useState } from 'react';
import type { ReactNode } from 'react';

interface AcordeonProps {
  titulo: ReactNode;
  contenido: ReactNode;
  startOpen?: boolean;
}

export default function Acordeon({ titulo, contenido, startOpen = false }: AcordeonProps) {
  const [estaAbierto, setEstaAbierto] = useState(startOpen);

  const alHacerClic = () => {
    setEstaAbierto(!estaAbierto);
  };

  return (
    <div
      className="mb-2 border rounded-3 shadow-sm"
      style={{
        backgroundColor: 'white',
        borderColor: '#e5e7eb',
        transition: 'all 0.3s ease',
      }}
    >
      <button
        onClick={alHacerClic}
        className="w-100 text-start py-3 px-4 d-flex justify-content-between align-items-center text-dark"
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          fontWeight: 600,
          fontSize: '1rem',
          cursor: 'pointer',
        }}
        aria-expanded={estaAbierto}
      >
        <span>{titulo}</span>
        <span
          style={{
            transform: estaAbierto ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            color: '#212529'
          }}
        >
          ⌄
        </span>
      </button>

      {estaAbierto && (
        <div className="p-4 pt-0">
          {contenido}
        </div>
      )}
    </div>
  );
}