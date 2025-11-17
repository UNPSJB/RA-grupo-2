import { useState } from 'react';
import { type EstadisticasData } from '../DashboardDpto';
import Dashlet from './Dashlet';
import GraficoBarrasEstadisticas from './GraficoDpto';

interface Props {
  estadisticasBasico: EstadisticasData | null;
  estadisticasSuperior: EstadisticasData | null;
}

export default function EstadisticasTabs({
  estadisticasBasico,
  estadisticasSuperior
}: Props) {
  const [tabActiva, setTabActiva] = useState<'basico' | 'superior'>('basico');

  const datosActivos = tabActiva === 'basico' ? estadisticasBasico : estadisticasSuperior;
  const colsDashlet = tabActiva === 'basico' ? 'row-cols-md-3' : 'row-cols-md-4';
  const noDataText = tabActiva === 'basico' 
    ? 'No hay datos de estadísticas para el Ciclo Básico.' 
    : 'No hay datos de estadísticas para el Ciclo Superior.';

  const hayDatosReales = datosActivos && 
                         datosActivos.promedio_general.length > 0 &&
                         datosActivos.promedio_general.some(item => item.porcentaje > 0);

  return (
    <div className="card shadow-lg rounded-3"> 
      <div className="card-header bg-transparent border-0 pt-3 px-3">
        <ul className="nav nav-pills card-header-pills">
          <li className="nav-item">
            <button 
              className={`nav-link ${tabActiva === 'basico' ? 'active' : ''}`} 
              onClick={() => setTabActiva('basico')}
            >
              Resumen Ciclo Básico (1º y 2º Año)
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${tabActiva === 'superior' ? 'active' : ''}`}
              onClick={() => setTabActiva('superior')}
            >
              Resumen Ciclo Superior (3º+ Año)
            </button>
          </li>
        </ul>
      </div>
      
      <div className="card-body p-4">
        {hayDatosReales ? (
          <>
            <div className={`row row-cols-1 ${colsDashlet} g-3 mb-4`}>
              {datosActivos!.promedio_general.map(item => (
                <Dashlet
                  key={item.opcion_id}
                  titulo={item.opcion_id}
                  valor={`${item.porcentaje.toFixed(1)}%`}
                />
              ))}
            </div>
            <hr className="my-4" />
            <div style={{ height: '600px' }}>
              <GraficoBarrasEstadisticas datosApi={datosActivos!.promedio_por_categoria} />
            </div>
          </>
        ) : ( 
          <div className="text-center text-muted p-4">
            <p className="mb-0">{noDataText}</p>
          </div>
        )}
      </div>
    </div>
  );
};