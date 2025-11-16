import { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import FiltrosDashboard from './dashboard/FiltrosDashboard';
import ProgresoDona from './dashboard/ProgresoDona';
import TablaPendientes from './dashboard/TablaPendientes';
import EstadisticasTabs from './dashboard/EstadisticasTabs';
import { getResolvedColor } from '../../utils/colors';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);
ChartJS.defaults.color = getResolvedColor('--color-text-primary');
ChartJS.defaults.borderColor = getResolvedColor('--color-grafico-gris');
ChartJS.defaults.font.family = "'Montserrat', sans-serif";

interface ProgresoData {
  completados: number;
  pendientes: number;
}
interface Carrera {
  id: number;
  nombre: string;
}
interface InformePendiente {
  materia: string;
  docente_responsable: string;
}
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
export interface EstadisticasData {
  promedio_por_categoria: CategoriaEstadistica[];
  promedio_general: OpcionPorcentaje[];
  total_respuestas: number;
}

const DEPARTAMENTO_ID = 1; 

export default function DashboardDepartamento() {
  const [anio, setAnio] = useState<number | null>(null);
  const [periodo, setPeriodo] = useState<string | null>(null);
  const [carreraId, setCarreraId] = useState<number | null>(null);
  const [aniosList, setAniosList] = useState<number[]>([]);
  const [periodosList, setPeriodosList] = useState<string[]>([]);
  const [carrerasList, setCarrerasList] = useState<Carrera[]>([]);
  const [progresoData, setProgresoData] = useState<ProgresoData | null>(null);
  const [pendientesData, setPendientesData] = useState<InformePendiente[] | null>(null);
  const [estadisticasBasico, setEstadisticasBasico] = useState<EstadisticasData | null>(null);
  const [estadisticasSuperior, setEstadisticasSuperior] = useState<EstadisticasData | null>(null);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    const cargarFiltros = async () => {
      try {
        const [resAnios, resPeriodos, resCarreras] = await Promise.all([
          fetch(`http://localhost:8000/filtros/anios`),
          fetch(`http://localhost:8000/filtros/periodos`),
          fetch(`http://localhost:8000/departamentos/${DEPARTAMENTO_ID}/carreras`)
        ]);
        const anios: number[] = await resAnios.json();
        const periodos: string[] = await resPeriodos.json();
        const carreras: Carrera[] = await resCarreras.json();
        setAniosList(anios);
        setPeriodosList(periodos);
        setCarrerasList(carreras);
        if (anios.length > 0) setAnio(anios[0]);
        if (periodos.length > 0) setPeriodo(periodos[0]);
      } catch (error) {
        console.error("Error cargando filtros:", error);
      } finally {
        setIsLoadingFilters(false);
      }
    };
    cargarFiltros();
  }, []); 

  useEffect(() => {
    if (isLoadingFilters || !anio || !periodo) { return; }
    const cargarDatosDelDashboard = async () => {
      setIsLoadingData(true);
      try {
        const params = new URLSearchParams({ anio: String(anio), periodo: periodo });
        if (carreraId) {
          params.append('carrera_id', String(carreraId));
        }
        const response = await fetch(
          `http://localhost:8000/departamentos/${DEPARTAMENTO_ID}/dashboard-completo?${params}`
        );
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${await response.text()}`);
        }
        const data = await response.json();
        setProgresoData(data.progreso);
        setEstadisticasBasico(data.estadisticas_basico);
        setEstadisticasSuperior(data.estadisticas_superior);
        setPendientesData(data.pendientes);
      } catch (error) {
        console.error("Error cargando datos del dashboard:", error);
      } finally {
        setIsLoadingData(false);
      }
    };
    cargarDatosDelDashboard();
  }, [anio, periodo, carreraId, isLoadingFilters]);

  if (isLoadingFilters) {
      return <div className="container mt-4"><p>Cargando filtros...</p></div>
  }

  return (
    <div className="container mt-4">
      <h2 className="h4 mb-3">Dashboard Departamento</h2>
      <FiltrosDashboard
        anio={anio}
        periodo={periodo}
        carreraId={carreraId}
        aniosList={aniosList}
        periodosList={periodosList}
        carrerasList={carrerasList}
        onAnioChange={setAnio}
        onPeriodoChange={setPeriodo}
        onCarreraChange={setCarreraId}
      />
      {isLoadingData ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando datos...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="row">
            <div className="col-md-5">
              <ProgresoDona
                progresoData={progresoData}
                anio={anio}
              />
            </div>
            <div className="col-md-7">
              <TablaPendientes pendientesData={pendientesData} />
            </div>
          </div>
          <div className="row mt-4 mb-4">
            <div className="col-12">
              <EstadisticasTabs
                estadisticasBasico={estadisticasBasico}
                estadisticasSuperior={estadisticasSuperior}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};