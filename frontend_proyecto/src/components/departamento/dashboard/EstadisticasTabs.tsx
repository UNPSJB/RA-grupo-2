import { useState } from 'react';
import { type EstadisticasData } from '../DashboardDpto';
import Dashlet from './Dashlet';
import GraficoBarrasEstadisticas from './GraficoDpto';

interface Props {
  estadisticasBasico: EstadisticasData | null;
  estadisticasSuperior: EstadisticasData | null;
}

export default function EstadisticasTabs({ estadisticasBasico, estadisticasSuperior }: Props) {
  const [tabActiva, setTabActiva] = useState<'basico' | 'superior'>('basico');

  const datosActivos = tabActiva === 'basico' ? estadisticasBasico : estadisticasSuperior;
  const colsDashlet = tabActiva === 'basico' ? 'row-cols-md-3' : 'row-cols-md-4';
  const noDataText = 'No hay datos estadísticos disponibles para este ciclo.';

  const hayDatosReales = datosActivos && 
                         datosActivos.promedio_general.length > 0;

  return (
    <div className="w-100"> 
      <div className="d-flex border-bottom mb-4 pb-2">
        <button 
            className={`btn btn-sm me-2 rounded-pill fw-medium ${tabActiva === 'basico' ? 'btn btn-theme-primary' : 'btn-light text-secondary'}`} 
            onClick={() => setTabActiva('basico')}
        >
            Ciclo Básico (1º y 2º)
        </button>
        <button 
            className={`btn btn-sm rounded-pill fw-medium ${tabActiva === 'superior' ? 'btn btn-theme-primary' : 'btn-light text-secondary'}`}
            onClick={() => setTabActiva('superior')}
        >
            Ciclo Superior (3º+)
        </button>
      </div>
      
      <div className="animate-fade-up">
        {hayDatosReales ? (
          <>
            <div className={`row ${colsDashlet} g-3 mb-5`}>
              {datosActivos!.promedio_general.map(item => (
                <Dashlet
                  key={item.opcion_id}
                  titulo={item.opcion_id}
                  valor={`${item.porcentaje.toFixed(1)}%`}
                />
              ))}
            </div>
            <div style={{ height: '500px', width: '100%' }}>
              <GraficoBarrasEstadisticas datosApi={datosActivos!.promedio_por_categoria} />
            </div>
          </>
        ) : ( 
          <div className="text-center text-muted py-5 bg-light rounded-3">
            <p className="mb-0">{noDataText}</p>
          </div>
        )}
      </div>
    </div>
  );
};