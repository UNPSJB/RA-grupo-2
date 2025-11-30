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

export default function ProgresoDona({ progresoData }: Props) {
  const colorCompletado = getResolvedColor('--color-brand-primary'); 
  const colorPendiente = getResolvedColor('--color-border'); 

  const optionsGraficoProgreso = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%', 
    events: [], 
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { enabled: false } 
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
        data: [completadosCount, pendientesCount],
        backgroundColor: [colorCompletado, colorPendiente],
        borderWidth: 0,
      },
    ],
  };

  if (!progresoData && total === 0) {
      return <div className="text-center text-muted p-4">Sin datos disponibles</div>;
  }

  return (
    <div className="d-flex flex-column align-items-center w-100 h-100 justify-content-center">
        <div className="position-relative" style={{ width: '220px', height: '220px' }}>
            <Doughnut options={optionsGraficoProgreso} data={dataGraficoProgreso} />
            
            <div className="position-absolute top-50 start-50 translate-middle text-center">
                <h2 className="mb-0 fw-bold display-6 text-dark">{porcentaje}%</h2>
                <span className="text-muted small">Completado</span>
            </div>
        </div>
        <div className="d-flex justify-content-center gap-4 mt-4">
            <div className="d-flex align-items-center">
                <span className="d-inline-block rounded-circle me-2" 
                      style={{ width: '10px', height: '10px', backgroundColor: colorCompletado }}>
                </span>
                <span className="text-secondary small">
                    Listo: <strong>{completadosCount}</strong>
                </span>
            </div>
            <div className="d-flex align-items-center">
                <span className="d-inline-block rounded-circle me-2" 
                      style={{ width: '10px', height: '10px', backgroundColor: colorPendiente }}>
                </span>
                <span className="text-secondary small">
                    Pendiente: <strong>{pendientesCount}</strong>
                </span>
            </div>
        </div>
    </div>
  );
};