import { getColorsByOption } from '../../../utils/colors'; 

interface Props {
  titulo: string; 
  valor: string; 
}

export default function Dashlet({ titulo, valor }: Props) {
  const { fuerte, suave } = getColorsByOption(titulo);

  return (
    <div className="col">
      <div 
        className="card rounded-3 shadow-sm h-100"
        style={{ backgroundColor: suave, border: 'none' }}
      >
        <div className="card-body p-3">
          <div className="d-flex align-items-center mb-2">
            <div 
              style={{ 
                width: '14px', 
                height: '14px', 
                backgroundColor: fuerte,
                borderRadius: '3px', 
                marginRight: '8px',
                flexShrink: 0 
              }} 
            />
            <span 
              className="text-muted" 
              style={{ fontSize: '0.9rem', fontWeight: 500 }}
            >
              {titulo}
            </span>
          </div>
          <div>
            <h4 
              className="fw-bold mb-0" 
              style={{ color: fuerte, fontSize: '1.75rem' }} 
            >
              {valor}
            </h4>
            <span className="text-muted" style={{ fontSize: '0.8rem' }}>
              Promedio general
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};