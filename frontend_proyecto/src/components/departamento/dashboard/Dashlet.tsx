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
          <div className="d-flex align-items-center mb-1">
            <div 
              style={{ 
                width: '12px', 
                height: '12px', 
                backgroundColor: fuerte,
                borderRadius: '3px', 
                marginRight: '10px',
                flexShrink: 0 
              }} 
            />
            <span 
              className="fw-semibold" 
              style={{ fontSize: '0.9rem', color: '#334155' }} 
            >
              {titulo}
            </span>
          </div>
          <div>
            <h4 
              className="fw-bold mb-0 mt-1" 
              style={{ color: fuerte, fontSize: '2rem' }} 
            >
              {valor}
            </h4>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}> 
              Promedio general
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};