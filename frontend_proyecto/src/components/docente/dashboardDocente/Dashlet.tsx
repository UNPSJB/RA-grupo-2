interface Props {
  titulo: string;
  valor: string;
}

export default function Dashlet({ titulo, valor }: Props) {
  const getColor = (titulo: string) => {
      const t = titulo.toLowerCase();
      if (t.includes('si') || t.includes('muy bueno')) return { fuerte: '#2e7d32', suave: '#e8f5e9' }; 
      if (t.includes('bueno')) return { fuerte: '#66bb6a', suave: '#f1f8e9' }; 
      if (t.includes('regular') || t.includes('npo')) return { fuerte: '#ffa726', suave: '#fff3e0' }; 
      if (t.includes('no') || t.includes('malo')) return { fuerte: '#ef5350', suave: '#ffebee' }; 
      return { fuerte: '#757575', suave: '#f5f5f5' }; 
  };

  const { fuerte, suave } = getColor(titulo);

  return (
    <div className="col">
      <div 
        className="card rounded-1 shadow-sm h-100 border-0"
        style={{ backgroundColor: suave }}
      >
        <div className="card-body p-3">
          <div className="d-flex align-items-center mb-2">
            <div 
              style={{ 
                width: '12px', height: '12px', backgroundColor: fuerte,
                borderRadius: '2px', marginRight: '8px', flexShrink: 0 
              }} 
            />
            <span className="text-muted text-uppercase" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
              {titulo}
            </span>
          </div>
          <div>
            <h4 className="fw-bold mb-0" style={{ color: fuerte, fontSize: '1.5rem' }}>
              {valor}
            </h4>
            <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
              Promedio general
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};