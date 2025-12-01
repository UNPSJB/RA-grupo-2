import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { getColorParaOpcion } from '../../../utils/colors';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface OpcionPorcentaje {
  opcion_id: string;
  porcentaje: number;
}

export interface CategoriaEstadistica {
  categoria_cod: string;   
  categoria_texto: string; 
  promedio_categoria: OpcionPorcentaje[];
  preguntas: any[];
}

interface Props {
  datosApi: CategoriaEstadistica[];
}

const getSortOrder = (cod: string) => {
  if (cod.startsWith('B')) return 1;
  if (cod.startsWith('C')) return 2;
  if (cod.startsWith('D')) return 3;
  if (cod.startsWith('E(TEORIA)')) return 4;
  if (cod.startsWith('E(PRACTICA)')) return 5;
  if (cod.startsWith('F')) return 6;
  return 99;
};


export default function GraficoBarrasEstadisticas({ datosApi }: Props) {
  const categoriaMap = new Map<string, string>();
  datosApi.forEach(cat => {
    categoriaMap.set(cat.categoria_cod, cat.categoria_texto);
  });

  const transformarDatosParaGrafico = (datos: CategoriaEstadistica[]) => {  
    let datosFiltrados = datos
      .filter(cat => cat.categoria_cod !== 'G'); 

    datosFiltrados.sort((a, b) => {
      return getSortOrder(a.categoria_cod) - getSortOrder(b.categoria_cod);
    });

    const labels = datosFiltrados.map(cat => cat.categoria_cod); 
    
    const opcionesSet = new Set<string>();
    datosFiltrados.forEach(cat => {
      cat.promedio_categoria.forEach(op => {
        opcionesSet.add(op.opcion_id);
      });
    });
    const opcionesUnicas = Array.from(opcionesSet);

    const datasets = opcionesUnicas.map((opcion) => {
      const data = labels.map(labelCode => { 
        const categoria = datosFiltrados.find(cat => cat.categoria_cod === labelCode);
        const opcionData = categoria?.promedio_categoria.find(op => op.opcion_id === opcion);
        return opcionData ? opcionData.porcentaje : 0;
      });
      return {
        label: opcion,
        data: data,
        backgroundColor: getColorParaOpcion(opcion),
      };
    });

    return { labels, datasets };
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { left: 0, right: 10, top: 0, bottom: 0 } },
    plugins: {
      legend: { display: false },
      title: { display: false }, 
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        padding: 10,
        cornerRadius: 6,
        titleFont: { family: "'Inter', sans-serif", size: 13 },
        bodyFont: { family: "'Inter', sans-serif", size: 12 },
        callbacks: {
          title: (tooltipItems: any) => {
            const codigoLabel = tooltipItems[0].label; 
            const textoLargo = categoriaMap.get(codigoLabel) || codigoLabel;
            return `${codigoLabel} - ${textoLargo}`;
          }
        }
      }
    },
    scales: {
      x: { 
        stacked: true,
        max: 100,
        grid: { color: '#f1f5f9', drawBorder: false }, 
        ticks: { 
            color: '#64748b', 
            font: { size: 11, weight: '500', family: "'Inter', sans-serif" } 
        },
        title: { 
          display: true, 
          text: 'PORCENTAJE (%)', 
          color: '#64748b', 
          font: { size: 11, weight: '700', family: "'Inter', sans-serif" },
          padding: { top: 10 }
        }
      },
      y: { 
        stacked: true,
        grid: { display: false, drawBorder: false }, 
        ticks: { 
            color: '#475569', 
            padding: 10, 
            font: { size: 12, weight: '600', family: "'Inter', sans-serif" }
        }
      },
    },
  };

  const data = transformarDatosParaGrafico(datosApi);

  return (
    <div className="w-100 h-100 d-flex flex-column">
        <h6 
            className="fw-bold mb-3 text-uppercase" 
            style={{
                color: '#64748b', 
                fontSize: '0.8rem', 
                letterSpacing: '0.5px',
                paddingLeft: '520px' 
            }}
        >
            RESUMEN ESTADÍSTICO POR CATEGORÍA
        </h6>
        
        {/* GRÁFICO */}
        <div style={{ flex: 1, minHeight: 0 }}>
            <Bar options={options as any} data={data} />
        </div>
    </div>
  );
};