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
    plugins: {
      legend: { 
        display: false 
      },
      title: { 
        display: true, 
        text: 'Resumen Estadístico por Categoría',
        font: {
          size: 18, 
          weight: 500 
        }
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems: any) => {
            const codigoLabel = tooltipItems[0].label; 
            const textoLargo = categoriaMap.get(codigoLabel) || codigoLabel;
            return `${codigoLabel}: ${textoLargo}`;
          }
        }
      }
    },
    scales: {
      x: { 
        stacked: true, 
        title: { display: true, text: 'Porcentaje (%)' ,
          font: {
          size: 15, 
          weight: 500 
        }
      }
      },
      y: { 
        stacked: true,
      },
    },
  };

  const data = transformarDatosParaGrafico(datosApi);

  return <Bar options={options} data={data} />;
};