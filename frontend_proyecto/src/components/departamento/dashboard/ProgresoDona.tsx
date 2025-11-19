import { Doughnut } from 'react-chartjs-2';
import { getResolvedColor } from '../../../utils/colors';

interface ProgresoData {
  completados: number;
  pendientes: number;
}

interface Props {
  progresoData: ProgresoData | null;
  anio: number | null;
}

export default function ProgresoDona({ progresoData, anio }: Props) {
  const colorCompletado = getResolvedColor('--color-unpsjb-blue');
  const colorPendiente = getResolvedColor('--color-grafico-gris');

  const optionsGraficoProgreso = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '80%', 
    events:[],
    plugins: {
      legend: { 
        display: false
      },
      title: { 
        display: false
      },
    },
  };

  const completadosCount = progresoData?.completados ?? 0;
  const pendientesCount = progresoData?.pendientes ?? 0;
  const total = completadosCount + pendientesCount;
  const porcentaje = total > 0 ? Math.round((completadosCount / total) * 100) : 0;

  const dataGraficoProgreso = {
    labels: ['Completado', 'Pendiente'],
    datasets: [
      {
        label: 'Progreso de Informes',
        data: [completadosCount, pendientesCount], 
        backgroundColor: [ colorCompletado, colorPendiente ], 
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="card shadow h-100">
      <div className="card-body p-4 d-flex flex-column">
        <h5 className="card-title mb-3">Progreso de Informes ({anio})</h5>
        <div className="flex-grow-1 d-flex align-items-center justify-content-center position-relative">
          {progresoData && total > 0 ? (
            <div 
              className="position-relative" 
              style={{ width: '250px', height: '250px' }}
            >
              <Doughnut options={optionsGraficoProgreso} data={dataGraficoProgreso} />
              <div 
                className="position-absolute top-50 start-50 translate-middle text-center"
              >
                <h2 className="mb-2 fw-bold display-6">{porcentaje}%</h2> 
                <span className="text-muted" style={{ fontSize: '1rem' }}> 
                  Completado
                </span>
              </div>
            </div>

          ) : (
            <div className="text-center text-muted p-4">
              <p className="mb-0">No hay datos de progreso.</p> 
            </div>
          )}
        </div>
        {progresoData && total > 0 && (
          <div className="d-flex justify-content-center mt-3">
            <div className="d-flex align-items-center me-4">
              <span 
                className="badge me-2" 
                style={{ 
                  backgroundColor: colorCompletado, 
                  width: '14px', 
                  height: '14px',
                  borderRadius: '3px' 
                }}
              >&nbsp;</span>
              <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                Completado: <strong>{completadosCount}</strong>
              </span>
            </div>
            <div className="d-flex align-items-center">
              <span 
                className="badge me-2" 
                style={{ 
                  backgroundColor: colorPendiente, 
                  width: '14px', 
                  height: '14px',
                  borderRadius: '3px'
                }}
              >&nbsp;</span>
              <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                Pendiente: <strong>{pendientesCount}</strong>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};