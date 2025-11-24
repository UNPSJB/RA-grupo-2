import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface OpcionPorcentaje {
  opcion_id: string;
  porcentaje: number;
}

interface Props {
  datos: OpcionPorcentaje[];
}

export default function GraficoDonaGeneral({ datos }: Props) {
  const orden = ['Si.', 'No.', 'NPO.'];

  const datosOrdenados = orden.map(label => {
      const encontrado = datos.find(d => d.opcion_id === label);
      return encontrado || { opcion_id: label, porcentaje: 0 };
  });

  const porcentajePositivo = Math.round(datosOrdenados.find(d => d.opcion_id === 'Si.')?.porcentaje || 0);

  const data = {
    labels: datosOrdenados.map(d => d.opcion_id),
    datasets: [
      {
        data: datosOrdenados.map(d => d.porcentaje),
        backgroundColor: [
            '#4BC0C0', // Si (Verde agua)
            '#FF6384', // No (Rojo)
            '#FFCE56'  // NPO (Amarillo)
        ],
        hoverBackgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, 
    cutout: '75%', 
    plugins: {
      legend: { 
        display: true,
        position: 'bottom' as const,
        labels: { 
            boxWidth: 12, 
            font: { size: 11 },
            padding: 15 
        }
      },
      tooltip: {
        callbacks: {
            label: function(context: any) {
                return ` ${context.label}: ${context.raw.toFixed(1)}%`;
            }
        }
      }
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <Doughnut data={data} options={options} />
        
        <div style={{ 
            position: 'absolute', 
            top: '45%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            textAlign: 'center',
            pointerEvents: 'none',
            width: '100%' 
        }}>
            <h2 className="mb-0 fw-bold text-secondary">{porcentajePositivo}%</h2>
            <small className="text-muted fw-bold" style={{ fontSize: '0.7rem' }}>APROBACIÓN</small>
        </div>
    </div>
  );
}