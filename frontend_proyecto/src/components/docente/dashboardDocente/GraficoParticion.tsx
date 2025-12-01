import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { getResolvedColor } from '../../../utils/colors';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  completadas: number;
  totalAlumnos: number;
}

export default function GraficoParticipacion({ completadas, totalAlumnos }: Props) {
  const pendientes = Math.max(0, totalAlumnos - completadas);
  const porcentaje = totalAlumnos > 0 ? Math.round((completadas / totalAlumnos) * 100) : 0;

  const colorPrincipal = getResolvedColor('--color-brand-primary') || '#005ec2';
  const colorFondo = '#e2e8f0';

  const data = {
    labels: ['Encuestas Recibidas', 'Sin Responder'],
    datasets: [
      {
        data: [completadas, pendientes],
        backgroundColor: [colorPrincipal, colorFondo],
        hoverBackgroundColor: [colorPrincipal, colorFondo],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '80%',
    hover: { mode: null },
    plugins: {
      legend: { display: false },
      tooltip: { 
        enabled: true,
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        callbacks: { label: (ctx: any) => ` ${ctx.label}: ${ctx.raw}` }
      }
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '160px', height: '160px', position: 'relative' }}>
          <Doughnut data={data} options={options as any} />
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none'
          }}>
            <h3 className="mb-0 fw-bold" style={{color: colorPrincipal}}>{porcentaje}%</h3>
            <small className="text-secondary text-uppercase fw-bold" style={{ fontSize: '0.6rem', letterSpacing: '0.5px' }}>
              Participación
            </small>
          </div>
      </div>
    </div>
  );
}
