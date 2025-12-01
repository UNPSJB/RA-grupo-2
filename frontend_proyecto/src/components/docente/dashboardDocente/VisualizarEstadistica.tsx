import { useEffect, useState } from 'react';
import GraficoBarrasDocente from './GraficoBarrasDocente';
import GraficoParticipacion from './GraficoParticion';
import api from '../../../services/api';
import { getResolvedColor } from '../../../utils/colors';

interface Props {
    materiaId: number;
    anio: number;
    periodo: string;
}

export interface CategoriaEstadistica {
    categoria_cod: string;
    categoria_texto: string;
    promedio_categoria: OpcionPorcentaje[];
    preguntas: any[];
}
interface OpcionPorcentaje { opcion_id: string; porcentaje: number; }
interface DatosEstadisticosPregunta { id_pregunta: string; datos: OpcionPorcentaje[]; }
interface CategoriaConDetalle extends CategoriaEstadistica { preguntas: DatosEstadisticosPregunta[]; }
interface DatosMateriaCompleto { promedio_por_categoria: CategoriaConDetalle[]; promedio_general: OpcionPorcentaje[]; }

const getColorForOption = (opcion: string) => {
    const op = opcion.toLowerCase(); 
    
    if (op.includes('no satisfactorio') || op.includes('malo') || op.includes('no.')) 
        return '#ef5350';

    if (op.includes('poco satisfactorio') || op.includes('regular') || op.includes('npo')) 
        return '#ffa726';

    if (op.includes('muy bueno') || op.includes('excelente') || op.includes('muy satisfactorio')) 
        return '#2e7d32';
    
    if (op.includes('bueno') || op.includes('satisfactorio') || op.includes('si')) 
        return '#66bb6a';
    
    return '#bdbdbd';
};

export default function VisualizadorEstadisticasMateria({ materiaId, anio, periodo }: Props) {
    const [datos, setDatos] = useState<DatosMateriaCompleto | null>(null);
    const [inscriptos, setInscriptos] = useState<number>(0);
    const [totalEncuestas, setTotalEncuestas] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const brandColor = getResolvedColor('--color-brand-primary'); 

    useEffect(() => {
        const cargarTodo = async () => {
            if (!materiaId) return;
            setLoading(true);
            setError(false);

            try {
                const resStats = await api.get(`/datos_estadisticos/materia/${materiaId}`, {
                    params: { anio, periodo }
                });
                setDatos(resStats.data);

                const resInsc = await api.get(`/datos_estadisticos/cantidad_inscriptos`, {
                    params: { id_materia: materiaId, anio, periodo }
                });
                setInscriptos(resInsc.data);

                const resCant = await api.get(`/datos_estadisticos/cantidad_encuestas_completadas`, {
                    params: { id_materia: materiaId, anio, periodo }
                });
                setTotalEncuestas(resCant.data);

            } catch (e) {
                console.error("Fallo en carga de datos:", e);
                setError(true);
            }
            finally { setLoading(false); }
        };
        cargarTodo();
    }, [materiaId, anio, periodo]);

    if (loading) return <div className="text-center p-5"><div className="spinner-border text-secondary" /></div>;

    if (error) return (
        <div className="alert alert-warning">
            Error al cargar datos de la materia.
        </div>
    );

    if (!datos || !datos.promedio_por_categoria.length) 
        return <div className="alert alert-light border p-4 text-center text-muted">No hay datos estadísticos para esta materia.</div>;

    return (
        <div className="card shadow-sm border-0 animate__animated animate__fadeIn rounded-3">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
                <h5 className="mb-0 fw-bold">
                    <span className="text-gradient">Resultados de Encuestas</span>
                </h5>
                <span className="badge bg-light text-secondary border fw-normal px-3 py-2">
                    Ciclo {anio} • {periodo}
                </span>
            </div>

            <div className="card-body p-4">

                <div className="row mb-5 align-items-center">
                    <div className="col-md-4 text-center border-end">
                        <h6 className="fw-bold mb-4 text-uppercase" style={{fontSize: '0.75rem', letterSpacing: '1px', color: '#475569'}}>
                            PARTICIPACIÓN
                        </h6>
                        <GraficoParticipacion completadas={totalEncuestas} totalAlumnos={inscriptos} />
                        <div className="mt-3 text-muted small">
                            <span className="fw-bold text-dark">{totalEncuestas}</span> de {inscriptos} alumnos
                        </div>
                    </div>

                    <div className="col-md-8 ps-md-5">
                        <h6 className="fw-bold mb-4 text-uppercase" style={{fontSize: '0.75rem', letterSpacing: '1px', color: '#475569'}}>
                            RENDIMIENTO POR CATEGORÍA
                        </h6>
                        <div style={{ height: '220px', width: '100%' }}>
                            <GraficoBarrasDocente datosApi={datos.promedio_por_categoria} />
                        </div>
                    </div>
                </div>

                <hr className="my-5 opacity-10" />

                <h5 className="mb-4 fw-medium text-dark" style={{fontSize: '1.1rem'}}>Desglose Detallado por Categoría</h5>

                <div className="accordion accordion-flush border rounded-3 overflow-hidden" id="accDetalleMateria">
                    {datos.promedio_por_categoria.map((cat, i) => (
                        <div className="accordion-item border-bottom" key={i}>
                            <h2 className="accordion-header">
                                <button
                                    className="accordion-button collapsed bg-white py-3"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target={`#cat-${i}`}
                                    style={{
                                        fontSize: '0.9rem',
                                        fontWeight: 500,
                                        color: '#334155'
                                    }}
                                >
                                    {cat.categoria_cod} - {cat.categoria_texto}
                                </button>
                            </h2>
                            <div id={`cat-${i}`} className="accordion-collapse collapse" data-bs-parent="#accDetalleMateria">
                                <div className="accordion-body bg-light bg-opacity-25 pt-4 pb-4">

                                    <div className="mb-4 p-3 bg-white rounded-3 border shadow-sm">
                                        <h6 className="fw-bold text-uppercase mb-3" style={{fontSize: '0.7rem', letterSpacing: '0.5px', color: '#64748b'}}>
                                            PROMEDIO DE LA CATEGORÍA
                                        </h6>
                                        <div className="d-flex gap-4 flex-wrap">
                                            {cat.promedio_categoria.map((op, idx) => (
                                                <div key={idx} className="d-flex align-items-center" style={{fontSize: '0.85rem'}}>
                                                    <span
                                                        className="d-inline-block rounded-circle me-2"
                                                        style={{
                                                            width: '10px', height: '10px',
                                                            backgroundColor: getColorForOption(op.opcion_id)
                                                        }}
                                                    ></span>
                                                    <span className="fw-semibold me-1 text-dark">{op.opcion_id}:</span>
                                                    <span className="text-secondary">{op.porcentaje.toFixed(1)}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="accordion mt-3" id={`accDetalleExtra-${i}`}>
                                        <div className="accordion-item border-0 bg-transparent">
                                            <h2 className="accordion-header">
                                                <button
                                                    className="accordion-button collapsed fw-bold bg-white border shadow-sm rounded-3"
                                                    type="button"
                                                    data-bs-toggle="collapse"
                                                    data-bs-target={`#detalleExtra-${i}`}
                                                    style={{ 
                                                        fontSize: '0.85rem', 
                                                        padding: '0.75rem 1.25rem',
                                                        color: brandColor 
                                                    }}
                                                >
                                                    <i className="bi bi-list-ul me-2"></i> Ver detalle por pregunta
                                                </button>
                                            </h2>

                                            <div id={`detalleExtra-${i}`} className="accordion-collapse collapse" data-bs-parent={`#accDetalleExtra-${i}`}>
                                                <div className="accordion-body px-0 pt-3">
                                                    {cat.preguntas && cat.preguntas.length > 0 ? (
                                                        <div>
                                                            {cat.preguntas.map((preg, j) => (
                                                                <div key={j} className="mb-3 p-3 border rounded-3 bg-white shadow-sm">
                                                                    <h6 className="fw-semibold mb-3" style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#1e293b' }}>
                                                                        {preg.id_pregunta}
                                                                    </h6>

                                                                    {preg.datos.map((op, k) => (
                                                                        <div key={k} className="d-flex align-items-center mb-2" style={{ fontSize: '0.85rem' }}>
                                                                            <div style={{ width: '100px' }} className="fw-medium text-secondary text-truncate" title={op.opcion_id}>
                                                                                {op.opcion_id}
                                                                            </div>

                                                                            <div className="flex-grow-1 mx-3">
                                                                                <div className="progress" style={{ height: '6px', backgroundColor: '#f1f5f9' }}>
                                                                                    <div
                                                                                        className="progress-bar rounded-pill"
                                                                                        role="progressbar"
                                                                                        style={{
                                                                                            width: `${op.porcentaje}%`,
                                                                                            backgroundColor: getColorForOption(op.opcion_id)
                                                                                        }}
                                                                                    ></div>
                                                                                </div>
                                                                            </div>

                                                                            <div style={{ width: '40px' }} className="text-end fw-bold text-dark small">
                                                                                {op.porcentaje.toFixed(0)}%
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-muted fst-italic small text-center py-2">No hay detalle disponible.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
