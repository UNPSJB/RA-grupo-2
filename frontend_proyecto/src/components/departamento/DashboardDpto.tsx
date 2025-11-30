import { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import FiltrosDashboard from './dashboard/FiltrosDashboard';
import ProgresoDona from './dashboard/ProgresoDona';
import TablaPendientes from './dashboard/TablaPendientes';
import EstadisticasTabs from './dashboard/EstadisticasTabs';
import { getResolvedColor } from '../../utils/colors';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);
ChartJS.defaults.color = '#334155'; 
ChartJS.defaults.borderColor = getResolvedColor('--color-border');

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

export default function DashboardDepartamento() {
  const { currentUser } = useAuth();
  const DEPARTAMENTO_ID = currentUser?.departamento_id;
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
          api.get(`/filtros/anios`),
          api.get(`/filtros/periodos`),
          api.get(`/departamentos/${DEPARTAMENTO_ID}/carreras`)
        ]);
        setAniosList(resAnios.data);
        setPeriodosList(resPeriodos.data);
        setCarrerasList(resCarreras.data);
        if (resAnios.data.length > 0) setAnio(resAnios.data[0]);
        if (resPeriodos.data.length > 0) setPeriodo(resPeriodos.data[0]);
      } catch (error) { console.error("Error filtros", error); } 
      finally { setIsLoadingFilters(false); }
    };
    cargarFiltros();
  }, []); 

  useEffect(() => {
    if (isLoadingFilters || !anio || !periodo) return;
    const cargarDatosDelDashboard = async () => {
      setIsLoadingData(true);
      try {
        const params = { anio: String(anio), periodo: periodo, ...(carreraId && { carrera_id: String(carreraId) }) };
        const response = await api.get(`/departamentos/${DEPARTAMENTO_ID}/dashboard-completo`, { params });
        setProgresoData(response.data.progreso);
        setEstadisticasBasico(response.data.estadisticas_basico);
        setEstadisticasSuperior(response.data.estadisticas_superior);
        setPendientesData(response.data.pendientes);
      } catch (error) { console.error("Error dashboard", error); } 
      finally { setIsLoadingData(false); }
    };
    cargarDatosDelDashboard();
  }, [anio, periodo, carreraId, isLoadingFilters]);

  const cardStyle = {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    border: 'var(--glass-border)',
    boxShadow: 'var(--shadow-sm)',
    padding: '1.5rem',
    height: '100%',
    transition: 'all 0.3s ease'
  };

  if (isLoadingFilters) return <div className="mt-5 text-center text-muted">Cargando sistema...</div>;

  return (
    <div className="mt-5 animate-fade-up">
      <div className="text-center mb-5">
        <h2 className="display-6 fw-bolder mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
          <span className="text-gradient">Resumen Estadístico</span>
        </h2>
        <p className="text-muted mx-auto" style={{maxWidth: '700px', fontWeight: 300}}>
            Visualice el estado de cumplimiento de los informes de cátedra y los resultados de encuestas académicas.
        </p>
      </div>

      <div className="mb-5" style={cardStyle}>
         <div className="d-flex justify-content-between align-items-center mb-3">
             <h6 className="text-uppercase text fw-medium mb-0" style={{fontSize: '0.90rem', letterSpacing: '1px'}}>
                Filtros Globales
             </h6>
         </div>
         
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
      </div>

      {isLoadingData ? (
        <div className="text-center py-5">
           <div className="spinner-border" style={{color: 'var(--color-brand-primary)'}} role="status"/>
        </div>
      ) : (
        <>
          <div className="mb-4 border-bottom pb-2">
            <h4 className="h5 fw-bold mb-0">
                <span className="text-gradient">Gestión de Informes de Cátedra</span>
            </h4>
            <small style={{color: 'var(--color-text-secondary)'}}>Seguimiento de entregas y cumplimiento</small>
        </div>

          <div className="row g-4 mb-5">
            <div className="col-lg-4 col-md-12">
              <div style={cardStyle}>
                <h6 className="fw-medium text-center mb-4 text-uppercase" 
                    style={{
                        color: '#334155',
                        fontSize: '0.90rem', 
                        letterSpacing: '1.0px'
                    }}>
                    PROGRESO DE INFORMES ({anio})
                </h6>
                <div className="d-flex justify-content-center align-items-center" style={{minHeight: '200px'}}>
                    <div style={{ maxWidth: '240px', width: '100%' }}> 
                        <ProgresoDona progresoData={progresoData} anio={anio} />
                    </div>
                </div>
              </div>
            </div>

            <div className="col-lg-8 col-md-12">
              <div style={cardStyle}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-medium mb-0 text-uppercase" 
                        style={{
                            color: '#334155', 
                            fontSize: '0.90rem', 
                            letterSpacing: '1.0px'
                        }}>
                        INFORMES PENDIENTES
                    </h5>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <TablaPendientes pendientesData={pendientesData} />
                  </div>
              </div>
            </div>
          </div>

          <hr className="my-5 opacity-10" />
          
          <div className="mb-4 border-bottom pb-2 mt-5"> 
            <h4 className="h5 fw-bold mb-0">
                <span className="text-gradient">Resultados de Encuestas</span>
            </h4>
            <small style={{color: 'var(--color-text-secondary)'}}>
                Opinión estudiantil sobre las cátedras.
            </small>
        </div>

        <div className="row mb-5">
          <div className="col-12">
            <div style={cardStyle}>
                <EstadisticasTabs
                  estadisticasBasico={estadisticasBasico}
                  estadisticasSuperior={estadisticasSuperior}
                />
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
}