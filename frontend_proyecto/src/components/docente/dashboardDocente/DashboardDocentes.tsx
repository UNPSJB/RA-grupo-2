import { useState, useEffect } from 'react';
import EstadisticasTabs from './EstadisticaTabs';
import VisualizadorEstadisticasMateria from './VisualizarEstadistica';
import GraficoDonaGeneral from './GraficoGeneral';
import { useAuth } from '../../../context/AuthContext';

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
    const [isLoadingDetalles, setIsLoadingDetalles] = useState(false);

    useEffect(() => {
        const cargarFiltros = async () => {
            try {
                const [resAnios, resPeriodos] = await Promise.all([
                    fetch(`http://localhost:8000/filtros/anios`),
                    fetch(`http://localhost:8000/filtros/periodos`)
                ]);
                const anios = await resAnios.json();
                const periodos = await resPeriodos.json();
                setAniosList(anios);
                setPeriodosList(periodos);
                if (anios.length > 0) setAnio(anios[0]);
                if (periodos.length > 0) setPeriodo(periodos[0]);
            } catch (error) { console.error(error); }
            finally { setIsLoadingFilters(false); }
        };
        cargarFiltros();
    }, []);

    useEffect(() => {
        if (!DOCENTE_ID) return;
        if (isLoadingFilters || !anio || !periodo) return;
        setMateriaSeleccionada('todas');
        setFiltroTexto('');

        const cargarDatosBase = async () => {
            setIsLoadingData(true);
            try {
                const params = new URLSearchParams({ anio: String(anio), periodo: periodo });
                const response = await fetch(`http://localhost:8000/docentes/${DOCENTE_ID}/dashboard-estadistico?${params}`);
                if (!response.ok) throw new Error('Error fetch dashboard');

                const data = await response.json();
                const basicoExiste = data.estadisticas_basico && data.estadisticas_basico.promedio_general.length > 0;
                const superiorExiste = data.estadisticas_superior && data.estadisticas_superior.promedio_general.length > 0;

                if (!basicoExiste && superiorExiste) {
                    setCicloActivo('superior');
                } else if (basicoExiste) {
                    setCicloActivo('basico');
                }

                setDashboardData(data);
                setMateriasDetalladas(data.materias_del_ciclo || []);
            } catch (error) { console.error(error); }
            finally { setIsLoadingData(false); }
        };
        cargarDatosBase();
    }, [anio, periodo, isLoadingFilters]);

    useEffect(() => {
        if (!dashboardData || !anio || !periodo) return;

        const enriquecerMaterias = async () => {
            if (dashboardData.materias_del_ciclo.length === 0) {
                setMateriasDetalladas([]);
                return;
            }

            setIsLoadingDetalles(true);
            const baseURL = "http://localhost:8000/datos_estadisticos";
            try {
                const promesas = dashboardData.materias_del_ciclo.map(async (materia) => {
                    try {
                        if (materia.cantidad_encuestas !== undefined && materia.cantidad_encuestas !== 0) return materia;

                        const resInsc = await fetch(`${baseURL}/cantidad_inscriptos?id_materia=${materia.id}&anio=${anio}&periodo=${periodo}`);
                        const inscriptosReal = resInsc.ok ? await resInsc.json() : 0;

                        const resEnc = await fetch(`${baseURL}/cantidad_encuestas_completadas?id_materia=${materia.id}&anio=${anio}&periodo=${periodo}`);
                        const encuestasReal = resEnc.ok ? await resEnc.json() : 0;

                        return { ...materia, cantidad_inscriptos: inscriptosReal, cantidad_encuestas: encuestasReal };
                    } catch (err) { return materia; }
                });
                const resultados = await Promise.all(promesas);
                setMateriasDetalladas(resultados);
            } catch (error) {
                console.error("Error enriqueciendo datos", error);
            } finally { setIsLoadingDetalles(false); }
        };
        enriquecerMaterias();
    }, [dashboardData, anio, periodo]);

    const materiasVisibles = materiasDetalladas.filter(m =>
        m.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        m.codigo.toLowerCase().includes(filtroTexto.toLowerCase())
    );
    const datosGraficoGeneral = cicloActivo === 'basico'
        ? (dashboardData?.estadisticas_basico?.promedio_general || [])
        : (dashboardData?.estadisticas_superior?.promedio_general || []);

    if (isLoadingFilters) return <div className="container mt-4"><div className="spinner-border text-primary" role="status" /></div>;

    if(!DOCENTE_ID) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger" role="alert">
                    No se pudo identificar al docente. Por favor vuelva a iniciar sesión.
                </div>
            </div>
        );
    }
    return (
        <div className="container mt-4 pb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="h4 mb-0 fw-bold text-dark">Tablero de Control Académico</h2>
                {materiaSeleccionada !== 'todas' && (
                    <button className="btn btn-sm btn-outline-dark" onClick={() => setMateriaSeleccionada('todas')}>&larr; Volver</button>
                )}
            </div>
            <div className="card shadow-sm border-0 mb-4 rounded-1">
                <div className="card-body py-3 px-4">
                    <div className="row g-3 align-items-center">
                        <div className="col-auto">
                            <label className="fw-bold me-2" style={{ fontSize: '0.85rem' }}>Año:</label>
                            <select className="form-select form-select-sm d-inline-block w-auto border-secondary" value={anio ?? ''} onChange={(e) => setAnio(Number(e.target.value))}>
                                {aniosList.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>
                        <div className="col-auto">
                            <label className="fw-bold me-2" style={{ fontSize: '0.85rem' }}>Cuatrimestre:</label>
                            <select className="form-select form-select-sm d-inline-block w-auto border-secondary" value={periodo ?? ''} onChange={(e) => setPeriodo(e.target.value)}>
                                {periodosList.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div className="col text-end">
                            <span className="text-muted small me-2">ENCUESTAS RECIBIDAS:</span>
                            <span className="fw-bold fs-5 text-primary">{dashboardData?.total_encuestas_completadas ?? 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {isLoadingData ? (
                <div className="text-center py-5"><div className="spinner-border text-secondary" role="status" /></div>
            ) : (
                <>
                    {materiaSeleccionada === 'todas' && dashboardData && (
                        <div className="animate__animated animate__fadeIn">
                            <div className="row g-4 align-items-stretch">
                                <div className="col-lg-4 col-md-5">
                                    <div className="card shadow-sm border-0 rounded-1 h-100">
                                        <div className="card-header bg-white border-0 pt-3 pb-0">
                                            <h6 className="fw-bold text-dark mb-0">
                                                Progreso {cicloActivo === 'basico' ? 'Ciclo Básico' : 'Ciclo Superior'} ({anio})
                                            </h6>
                                        </div>
                                        <div className="card-body d-flex flex-column justify-content-center align-items-center py-4">
                                            <div style={{ width: '80%', maxWidth: '300px', aspectRatio: '1/1', position: 'relative' }}>
                                                <GraficoDonaGeneral
                                                    datos={datosGraficoGeneral}
                                                    cicloActivo={cicloActivo}
                                                />
                                            </div>
                                            <div className="mt-3 text-center">
                                                <p className="small text-muted mb-0">Promedio General</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-8 col-md-7">
                                    <div className="card shadow-sm border-0 rounded-1 h-100">
                                        <div className="card-header bg-white border-0 pt-3 pb-2 d-flex justify-content-between align-items-end">
                                            <h6 className="fw-bold text-dark mb-0">Materias del Ciclo</h6>
                                            {isLoadingDetalles && <small className="text-muted fst-italic" style={{ fontSize: '0.7rem' }}>Actualizando...</small>}
                                        </div>
                                        <div className="card-body p-0">
                                            <div className="px-3 pb-3 bg-white">
                                                <div className="input-group input-group-sm">
                                                    <span className="input-group-text bg-primary bg-opacity-10 border-primary text-primary"><i className="bi bi-search"></i></span>
                                                    <input type="text" className="form-control border-primary bg-light" placeholder="Filtrar materia..." value={filtroTexto} onChange={(e) => setFiltroTexto(e.target.value)} style={{ boxShadow: 'none' }} />
                                                </div>
                                            </div>
                                            <div className="table-responsive">
                                                <table className="table table-hover table-bordered mb-0 align-middle" style={{ borderColor: '#dee2e6' }}>
                                                    <thead className="bg-light">
                                                        <tr>
                                                            <th className="ps-3 py-2 text-dark small">Materia</th>
                                                            <th className="text-center py-2 text-dark small" style={{ width: '90px' }}>Inscriptos</th>
                                                            <th className="text-center py-2 text-dark small" style={{ width: '90px' }}>Encuestas</th>
                                                            <th style={{ width: '40px' }}></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {materiasVisibles.map((mat) => (
                                                            <tr key={mat.id} style={{ cursor: 'pointer', fontSize: '0.85rem' }} onClick={() => setMateriaSeleccionada(mat.id)}>
                                                                <td className="ps-3 py-1">
                                                                    <div className="fw-bold text-dark">{mat.nombre}</div>
                                                                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{mat.codigo}</div>
                                                                </td>
                                                                <td className="text-center py-1 fw-bold text-secondary">{mat.cantidad_inscriptos}</td>
                                                                <td className="text-center py-1">
                                                                    <span className={mat.cantidad_encuestas > 0 ? 'fw-bold text-success' : 'text-muted'}>{mat.cantidad_encuestas}</span>
                                                                </td>
                                                                <td className="text-center py-1 text-muted"><i className="bi bi-caret-right-fill small"></i></td>
                                                            </tr>
                                                        ))}
                                                        {materiasVisibles.length === 0 && (<tr><td colSpan={4} className="text-center py-3 small text-muted">Sin resultados</td></tr>)}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row mt-4">
                                <div className="col-12">
                                    <div className="card shadow-sm border-0 rounded-1">
                                        <div className="card-header bg-white border-bottom border-light pt-3">
                                            <h6 className="fw-bold text-dark mb-0">Desglose por Categoría</h6>
                                        </div>
                                        <div className="card-body">
                                            <EstadisticasTabs
                                                estadisticasBasico={dashboardData.estadisticas_basico}
                                                estadisticasSuperior={dashboardData.estadisticas_superior}
                                                onChangeTab={(tab) => setCicloActivo(tab)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {materiaSeleccionada !== 'todas' && anio && periodo && (
                        <div className="animate__animated animate__fadeIn">
                            <div className="card shadow-sm border-0 mb-3 rounded-1">
                                <div className="card-body py-2 d-flex align-items-center">
                                    <i className="bi bi-folder2-open me-2 text-primary"></i>
                                    <span className="text-dark small">Viendo detalle de: <strong className="text-uppercase">{dashboardData?.materias_del_ciclo.find(m => m.id === materiaSeleccionada)?.nombre}</strong></span>
                                </div>
                            </div>
                            <VisualizadorEstadisticasMateria
                                materiaId={Number(materiaSeleccionada)}
                                anio={anio}
                                periodo={periodo}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}