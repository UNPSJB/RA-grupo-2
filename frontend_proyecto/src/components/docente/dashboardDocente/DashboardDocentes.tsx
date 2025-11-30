import { useState, useEffect } from 'react';
import EstadisticasTabs from './EstadisticaTabs';
import VisualizadorEstadisticasMateria from './VisualizarEstadistica';
import GraficoDonaGeneral from './GraficoGeneral';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';

interface OpcionPorcentaje { opcion_id: string; porcentaje: number; }
interface MateriaInfo { id: number; nombre: string; codigo: string; cantidad_inscriptos: number; cantidad_encuestas: number; }
interface CategoriaEstadistica { categoria_cod: string; categoria_texto: string; promedio_categoria: OpcionPorcentaje[]; preguntas: any[]; }
interface EstadisticasDataBackend { promedio_por_categoria: CategoriaEstadistica[]; promedio_general: OpcionPorcentaje[]; }

interface DashboardDocenteData {
    total_encuestas_completadas: number;
    estadisticas_basico: EstadisticasDataBackend | null;
    estadisticas_superior: EstadisticasDataBackend | null;
    estadisticas_general: OpcionPorcentaje[];
    materias_del_ciclo: MateriaInfo[];
}

export default function DashboardDocente() {
    const { currentUser } = useAuth();
    const DOCENTE_ID = currentUser?.docente_id;
    
    const [anio, setAnio] = useState<number | null>(null);
    const [periodo, setPeriodo] = useState<string | null>(null);
    const [materiaSeleccionada, setMateriaSeleccionada] = useState<string | number>('todas');
    const [filtroTexto, setFiltroTexto] = useState<string>('');
    const [cicloActivo, setCicloActivo] = useState<'basico' | 'superior'>('basico');
    
    const [aniosList, setAniosList] = useState<number[]>([]);
    const [periodosList, setPeriodosList] = useState<string[]>([]);
    const [dashboardData, setDashboardData] = useState<DashboardDocenteData | null>(null);
    const [materiasDetalladas, setMateriasDetalladas] = useState<MateriaInfo[]>([]);

    const [isLoadingFilters, setIsLoadingFilters] = useState(true);
    const [isLoadingData, setIsLoadingData] = useState(false);
    

    const cardStyle = {
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: 'var(--glass-border)',
        boxShadow: 'var(--shadow-sm)',
        padding: '1.5rem',
        height: '100%',
        transition: 'all 0.3s ease'
    };

    useEffect(() => {
        const cargarFiltros = async () => {
            try {
                const [resAnios, resPeriodos] = await Promise.all([
                    api.get("/filtros/anios"),
                    api.get("/filtros/periodos"),
                ]);
                setAniosList(resAnios.data);
                setPeriodosList(resPeriodos.data);
                if (resAnios.data.length > 0) setAnio(resAnios.data[0]);
                if (resPeriodos.data.length > 0) setPeriodo(resPeriodos.data[0]);
            } catch (error) { console.error("Error filtros:", error); } 
            finally { setIsLoadingFilters(false); }
        };
        cargarFiltros();
    }, []);

    useEffect(() => {
        if (!DOCENTE_ID || isLoadingFilters || !anio || !periodo) return;
        setMateriaSeleccionada("todas");
        setFiltroTexto("");

        const cargarDatosBase = async () => {
            setIsLoadingData(true);
            try {
                const response = await api.get(`/docentes/${DOCENTE_ID}/dashboard-estadistico`, {
                    params: { anio: String(anio), periodo: periodo }
                });
                const data = response.data;
                
                const basicoExiste = data.estadisticas_basico?.promedio_general.length > 0;
                const superiorExiste = data.estadisticas_superior?.promedio_general.length > 0;
                
                if (!basicoExiste && superiorExiste) setCicloActivo("superior");
                else if (basicoExiste) setCicloActivo("basico");

                setDashboardData(data);
                setMateriasDetalladas(data.materias_del_ciclo || []);
            } catch (error) { console.error("Error dashboard:", error); } 
            finally { setIsLoadingData(false); }
        };
        cargarDatosBase();
    }, [anio, periodo, isLoadingFilters, DOCENTE_ID]);

    useEffect(() => {
        if (!dashboardData || !anio || !periodo) return;
        const enriquecerMaterias = async () => {
            if (dashboardData.materias_del_ciclo.length === 0) {
                setMateriasDetalladas([]);
                return;
            }
            
            try {
                const promesas = dashboardData.materias_del_ciclo.map(async (materia) => {
                    if (materia.cantidad_encuestas !== undefined && materia.cantidad_encuestas !== 0) return materia;
                    try {
                        const [resInsc, resEnc] = await Promise.all([
                            api.get(`/datos_estadisticos/cantidad_inscriptos`, { params: { id_materia: materia.id, anio, periodo } }),
                            api.get(`/datos_estadisticos/cantidad_encuestas_completadas`, { params: { id_materia: materia.id, anio, periodo } })
                        ]);
                        return { ...materia, cantidad_inscriptos: resInsc?.data ?? 0, cantidad_encuestas: resEnc?.data ?? 0 };
                    } catch { return materia; }
                });
                const resultados = await Promise.all(promesas);
                setMateriasDetalladas(resultados);
            } catch (error) { console.error("Error enriqueciendo", error); } 
           
        };
        enriquecerMaterias();
    }, [dashboardData, anio, periodo]);

    const hayDatosEnElCiclo = cicloActivo === 'basico' 
        ? (dashboardData?.estadisticas_basico?.promedio_general?.length ?? 0) > 0
        : (dashboardData?.estadisticas_superior?.promedio_general?.length ?? 0) > 0;

    const materiasVisibles = materiasDetalladas.filter(m =>
        m.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        m.codigo.toLowerCase().includes(filtroTexto.toLowerCase())
    );
    const datosGraficoGeneral = cicloActivo === 'basico'
        ? (dashboardData?.estadisticas_basico?.promedio_general || [])
        : (dashboardData?.estadisticas_superior?.promedio_general || []);

    if (isLoadingFilters) return <div className="mt-5 text-center text-muted">Cargando sistema...</div>;
    if (!DOCENTE_ID) return <div className="alert alert-danger mt-4">Error de identificación docente.</div>;

    return (
        <div className="mt-4 animate-fade-up">
            
            <div className="text-center mb-5">
                <h2 className="fw-bold mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <span className="text-gradient">Resumen Académico</span>
                </h2>
                <p className="text-muted mx-auto" style={{maxWidth: '700px', fontWeight: 300}}>
                   Visualice los resultados de las encuestas.
                </p>
            </div>

            <div className="mb-4" style={cardStyle}>
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                    <div className="d-flex align-items-center gap-4">
                        <div className="d-flex align-items-center">
                            <label className="text-uppercase text-secondary fw-bold me-2" style={{fontSize: '0.7rem', letterSpacing: '1px'}}>AÑO:</label>
                            <select className="form-select form-select-sm bg-light border-0 text-dark fw-medium" style={{boxShadow: 'none', cursor: 'pointer', minWidth: '90px'}} value={anio ?? ''} onChange={(e) => setAnio(Number(e.target.value))}>
                                {aniosList.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>
                        <div className="d-flex align-items-center">
                            <label className="text-uppercase text-secondary fw-bold me-2" style={{fontSize: '0.7rem', letterSpacing: '1px'}}>CUATRIMESTRE:</label>
                            <select className="form-select form-select-sm bg-light border-0 text-dark fw-medium" style={{boxShadow: 'none', cursor: 'pointer', minWidth: '150px'}} value={periodo ?? ''} onChange={(e) => setPeriodo(e.target.value)}>
                                {periodosList.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="d-flex align-items-center">
                        <span className="text-secondary me-2 text-uppercase fw-bold" style={{fontSize: '0.7rem', letterSpacing: '1px'}}>ENCUESTAS RECIBIDAS:</span>
                        <span className="fw-bold fs-4 text-primary lh-1">{dashboardData?.total_encuestas_completadas ?? 0}</span>
                    </div>
                </div>
            </div>

            {isLoadingData ? (
                <div className="text-center py-5"><div className="spinner-border text-primary" role="status" /></div>
            ) : (
                <>
                    {materiaSeleccionada === 'todas' && dashboardData && (
                        <div className="animate-fade-up">
                            <div className="row g-4 mb-5">
                                
                                <div className="col-lg-4 col-md-12">
                                    <div style={cardStyle} className="d-flex flex-column">
                                        <h6 className="fw-bold text-center mb-3 text-uppercase" style={{color: '#334155', fontSize: '0.75rem', letterSpacing: '1.5px'}}>
                                            PROMEDIO {cicloActivo === 'basico' ? 'CICLO BÁSICO' : 'CICLO SUPERIOR'}
                                        </h6>
                                        <div className="flex-grow-1 d-flex align-items-center justify-content-center" style={{ minHeight: '300px' }}>
                                            <div style={{ width: '100%', maxWidth: '260px', height: '260px' }}>
                                                <GraficoDonaGeneral datos={datosGraficoGeneral} cicloActivo={cicloActivo} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-lg-8 col-md-12">
                                    <div style={cardStyle} className="d-flex flex-column h-100">
                                        {hayDatosEnElCiclo ? (
                                            <>
                                                <div className="mb-3 flex-shrink-0">
                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <h6 className="fw-bold mb-0 text-uppercase" style={{color: '#334155', fontSize: '0.75rem', letterSpacing: '1.5px'}}>MATERIAS DEL CICLO</h6>
                                                    </div>
                                                    <div className="w-100 position-relative">                                                                                                               
                                                        <input type="text" className="form-control bg-light border-0 text-secondary" placeholder="Buscar materia..." value={filtroTexto} onChange={(e) => setFiltroTexto(e.target.value)} style={{boxShadow: 'none', paddingTop: '0.45rem', paddingBottom: '0.45rem', paddingLeft: '0.75rem', fontSize: '0.85rem'}} />
                                                    </div>
                                                </div>
                                                <div className="table-responsive flex-grow-1" style={{ height: '300px', overflowY: 'auto' }}>
                                                    <table className="table align-middle mb-0">
                                                        <thead className="bg-light" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                                                            <tr>
                                                                <th className="border-0 ps-3 py-2 text-secondary fw-bold text-uppercase bg-light" style={{fontSize: '0.7rem', letterSpacing: '0.5px'}}>Materia</th>
                                                                <th className="border-0 text-center py-2 text-secondary fw-bold text-uppercase bg-light" style={{fontSize: '0.7rem', letterSpacing: '0.5px'}}>Inscriptos</th>
                                                                <th className="border-0 text-center py-2 text-secondary fw-bold text-uppercase bg-light" style={{fontSize: '0.7rem', letterSpacing: '0.5px'}}>Encuestas</th>
                                                                <th className="border-0 bg-light"></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {materiasVisibles.map((mat) => (
                                                                <tr key={mat.id} style={{cursor: 'pointer', borderBottom: '1px solid #f1f5f9'}} onClick={() => setMateriaSeleccionada(mat.id)}>
                                                                    <td className="ps-3 py-3">
                                                                        <div className="fw-semibold text-dark" style={{fontSize: '0.85rem'}}>{mat.nombre}</div>
                                                                        <div className="text-muted" style={{fontSize: '0.75rem'}}>{mat.codigo}</div>
                                                                    </td>
                                                                    <td className="text-center py-3 text-secondary fw-medium" style={{fontSize: '0.9rem'}}>{mat.cantidad_inscriptos}</td>
                                                                    <td className="text-center py-3">
                                                                        <span className={`fw-bold ${mat.cantidad_encuestas > 0 ? 'text-primary' : 'text-muted'}`} style={{fontSize: '0.9rem'}}>{mat.cantidad_encuestas}</span>
                                                                    </td>
                                                                    <td className="text-end pe-3 text-muted"> &gt; </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted opacity-50 py-5">
                                                <span className="fw-medium">No hay materias disponibles</span>
                                                <small>para el ciclo seleccionado.</small>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="row mb-5">
                                <div className="col-12">
                                    <div style={cardStyle}>
                                        <EstadisticasTabs
                                            estadisticasBasico={dashboardData.estadisticas_basico}
                                            estadisticasSuperior={dashboardData.estadisticas_superior}
                                            cicloActivo={cicloActivo}
                                            onChangeTab={(tab) => setCicloActivo(tab)} 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {materiaSeleccionada !== 'todas' && anio && periodo && (
                        <div className="animate-fade-up">
                            <button onClick={() => setMateriaSeleccionada('todas')} className="btn btn-link text-decoration-none text-secondary mb-3 ps-0 d-flex align-items-center">
                                &larr; Volver al resumen general
                            </button>
                            <VisualizadorEstadisticasMateria materiaId={Number(materiaSeleccionada)} anio={anio} periodo={periodo} />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
