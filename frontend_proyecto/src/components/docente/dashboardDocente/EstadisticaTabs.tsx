import GraficoBarrasDocente from './GraficoBarrasDocente';

interface OpcionPorcentaje { opcion_id: string; porcentaje: number; }
interface CategoriaEstadistica { categoria_cod: string; categoria_texto: string; promedio_categoria: OpcionPorcentaje[]; preguntas: any[]; }
interface EstadisticasDataBackend { promedio_por_categoria: CategoriaEstadistica[]; promedio_general: OpcionPorcentaje[]; }

interface Props {
  estadisticasBasico: EstadisticasDataBackend | null;
  estadisticasSuperior: EstadisticasDataBackend | null;
  cicloActivo: 'basico' | 'superior';
  onChangeTab: (tab: 'basico' | 'superior') => void;
}

const DashletDocente = ({ titulo, valor, colorFuerte }: { titulo: string, valor: string, colorFuerte: string }) => (
    <div className="col-md-3 col-sm-6">
        <div 
            className="p-3 h-100 rounded-3 border shadow-sm d-flex flex-column justify-content-between text-center bg-white" 
            style={{ borderColor: 'rgba(0,0,0,0.05)' }}
        >
            <div className="d-flex align-items-center justify-content-center mb-2">
                <div style={{ width: '8px', height: '8px', backgroundColor: colorFuerte, borderRadius: '50%', marginRight: '6px' }} />
                <span 
                    className="fw-bold text-uppercase text-muted" 
                    style={{fontSize: '0.7rem', letterSpacing: '0.5px'}} 
                    title={titulo}
                >
                    {titulo.split(',')[0]}
                </span>
            </div>
            <div>
                <span className="display-6 fw-bold" style={{fontSize: '2.2rem', color: colorFuerte}}>
                    {valor}%
                </span>
                <span className="d-block small fw-medium text-muted opacity-75" style={{fontSize: '0.7rem'}}>
                    Promedio general
                </span>
            </div>
        </div>
    </div>
);

export default function EstadisticasTabs({ 
    estadisticasBasico, 
    estadisticasSuperior, 
    cicloActivo, 
    onChangeTab 
}: Props) {

  const datosActivos = cicloActivo === 'basico' ? estadisticasBasico : estadisticasSuperior;
  
  const colorMap: Record<string, string> = {
      'Muy Bueno': '#16a34a',
      'Bueno':     '#059669',
      'Regular':   '#d97706',
      'Malo':      '#dc2626',
      'Si.':       '#16a34a',
      'No.':       '#dc2626',
      'NPO.':      '#ca8a04'
  };

  const getColor = (titulo: string) => {
      const key = Object.keys(colorMap).find(k => titulo.toLowerCase().includes(k.toLowerCase().replace('.', '')));
      return key ? colorMap[key] : '#475569';
  };

  const hayDatosGenerales = datosActivos && datosActivos.promedio_general && datosActivos.promedio_general.length > 0;
  
  const hayDatosCategorias = datosActivos?.promedio_por_categoria && 
                             datosActivos.promedio_por_categoria.length > 0 &&
                             datosActivos.promedio_por_categoria.some(c => c.promedio_categoria.length > 0);

  return (
    <div className="w-100">
      <div className="d-flex border-bottom mb-4 pb-2 justify-content-center justify-content-md-start">
        <button 
            className={`btn btn-sm me-2 rounded-pill fw-medium px-4 ${cicloActivo === 'basico' ? 'btn btn-theme-primary' : 'btn-light text-secondary'}`} 
            onClick={() => onChangeTab('basico')}
        >
            Ciclo Básico (1º y 2º)
        </button>
        <button 
            className={`btn btn-sm rounded-pill fw-medium px-4 ${cicloActivo === 'superior' ? 'btn btn-theme-primary' : 'btn-light text-secondary'}`}
            onClick={() => onChangeTab('superior')}
        >
            Ciclo Superior (3º+)
        </button>
      </div>

      <div className="animate-fade-up">
          {hayDatosGenerales ? (
            <>
                <div className="row g-3 mb-5">
                    {datosActivos!.promedio_general.map((item) => (
                        <DashletDocente 
                            key={item.opcion_id}
                            titulo={item.opcion_id}
                            valor={item.porcentaje.toFixed(1)}
                            colorFuerte={getColor(item.opcion_id)}
                        />
                    ))}
                </div>

                <div className="mt-4">
                     <h6 className="text-secondary fw-bold text-uppercase mb-4 text-center" style={{fontSize: '0.8rem', letterSpacing: '1.5px'}}>
                        Detalle por Categoría
                     </h6>
                     
                     <div style={{ height: '400px' }}>
                        {hayDatosCategorias ? (
                            <GraficoBarrasDocente datosApi={datosActivos!.promedio_por_categoria} />
                        ) : (
                            <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted bg-light rounded-3 border border-light-subtle">
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="bi bi-bar-chart opacity-25 mb-3" viewBox="0 0 16 16">
                                  <path d="M4 11H2v3h2v-3zm5-4H7v7h2V7zm5-5h-2v12h2V2zm-2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1h-2zM6 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm-5 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3z"/>
                                </svg>
                                <span className="fw-medium">No hay detalle por categorías disponible</span>
                                <small className="opacity-75">Las encuestas recibidas no contienen datos suficientes para este desglose.</small>
                            </div>
                        )}
                     </div>
                </div>
            </>
          ) : (
            <div className="text-center py-5 text-muted bg-light rounded-3 mt-3">
                <p className="mb-0 fw-bold">Sin datos registrados</p>
                <small>No se encontraron encuestas para el {cicloActivo === 'basico' ? 'Ciclo Básico' : 'Ciclo Superior'} en este período.</small>
            </div>
          )}
      </div>
    </div>
  );
}
