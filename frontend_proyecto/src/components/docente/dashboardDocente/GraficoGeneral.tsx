import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface OpcionPorcentaje { 
  opcion_id: string; 
  porcentaje: number; 
}
interface Props { 
  datos: OpcionPorcentaje[]; 
  cicloActivo: 'basico' | 'superior'; 
}

export default function GraficoDonaGeneral({ datos }: Props) {
  
  const getColor = (opcion: string) => {
      const op = opcion.toLowerCase();
      if (op.includes('no satisfactorio') || op.includes('malo') || op.includes('no.')) return '#ef4444'; 
      if (op.includes('poco satisfactorio') || op.includes('regular') || op.includes('npo')) return '#f59e0b'; 
      if (op.includes('muy bueno') || op.includes('excelente') || op.includes('si')) return '#15803d'; 
      if (op.includes('bueno') || op.includes('satisfactorio')) return '#22c55e'; 
      return '#cbd5e1'; 
  };

  const getShortLabel = (opcion: string) => {
      const op = opcion.toLowerCase();
      if (op.includes('muy')) return 'Muy Bueno';
      if (op.includes('bueno')) return 'Bueno';
      if (op.includes('regular') || op.includes('poco')) return 'Regular';
      if (op.includes('malo') || op.includes('no')) return 'Malo';
      return 'N/A';
  };

  const labels = datos.map(d => getShortLabel(d.opcion_id));
  const dataValues = datos.map(d => d.porcentaje);
  const backgroundColors = datos.map(d => getColor(d.opcion_id));

  const totalPositivo = datos
    .filter(d => d.opcion_id.toLowerCase().includes('bueno') || d.opcion_id.toLowerCase().includes('si'))
    .reduce((acc, curr) => acc + curr.porcentaje, 0);

  const options = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '75%',
  hover: { mode: 'nearest' as const, intersect: true },

  plugins: {
    legend: { 
      display: true,
      position: 'bottom' as const,
      margin: 30,
      labels: {
        padding: 10,
        boxWidth: 7,
        usePointStyle: true,
        font: { size: 10, family: "'Inter', sans-serif", weight: '500' },
        color: '#64748b'
      }
    },

    tooltip: { 
      enabled: true,
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      padding: 10,
      cornerRadius: 6,
      callbacks: {
        label: function(context: any) {
          const value = context.raw || 0;
          return ` ${context.label}: ${value.toFixed(1)}%`;
        }
      }
    }
  },

  animation: { animateScale: true, animateRotate: true }
};

  const chartData = {
    labels,
    datasets: [{
      data: dataValues,
      backgroundColor: backgroundColors,
      borderWidth: 2,
      borderColor: '#ffffff',
      hoverOffset: 4
    }]
  };

  if (datos.length === 0) return <div className="text-center text-muted py-5">Sin datos</div>;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}> 
          <Doughnut data={chartData} options={options as any} />
          
          <div 
            style={{
                position: 'absolute',
                top: '45%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                pointerEvents: 'none',
                width: '100%'
            }}
          >
              <h2 className="mb-0 fw-bold text-dark" style={{fontSize: '1.8rem', lineHeight: '1'}}>
                {Math.round(totalPositivo)}%
              </h2>
              <span className="text-muted text-uppercase fw-bold" style={{fontSize: '0.6rem', letterSpacing: '1px', display: 'block', marginTop: '4px'}}>
                POSITIVO
              </span>
          </div>
      </div>
    </div>
  );
}