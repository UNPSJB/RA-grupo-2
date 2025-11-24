import { useEffect, useState } from 'react';
import GraficoBarrasEstadisticas, { type CategoriaEstadistica } from '../../departamento/dashboard/GraficoDpto';
import GraficoParticipacion from './GraficoParticion';

interface Props {
    materiaId: number;
    anio: number;
    periodo: string;
}

interface OpcionPorcentaje { 
    opcion_id: string; 
    porcentaje: number; }

interface DatosEstadisticosPregunta { 
    id_pregunta: string; 
    datos: OpcionPorcentaje[]; }

interface CategoriaConDetalle extends CategoriaEstadistica {
    preguntas: DatosEstadisticosPregunta[];
}

interface DatosMateriaCompleto {
    promedio_por_categoria: CategoriaConDetalle[];
    promedio_general: OpcionPorcentaje[];
}

export default function VisualizadorEstadisticasMateria({ materiaId, anio, periodo }: Props) {
    const [datos, setDatos] = useState<DatosMateriaCompleto | null>(null);
    const [inscriptos, setInscriptos] = useState<number>(0);
    const [totalEncuestas, setTotalEncuestas] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        const cargarTodo = async () => {
            if (!materiaId) return;
            setLoading(true);
            setError(false);
            
            const baseURL = "http://localhost:8000/datos_estadisticos"; 

            try {
                console.log("Iniciando carga para materia:", materiaId);
                const resStats = await fetch(`${baseURL}/materia/${materiaId}?anio=${anio}&periodo=${periodo}`);
                if (!resStats.ok) throw new Error(`Error Stats: ${resStats.status}`);
                const dataStats = await resStats.json();
                setDatos(dataStats);
                const resInsc = await fetch(`${baseURL}/cantidad_inscriptos?id_materia=${materiaId}&anio=${anio}&periodo=${periodo}`);
                if (!resInsc.ok) throw new Error(`Error Inscriptos: ${resInsc.status}`);
                setInscriptos(await resInsc.json());
                const resCant = await fetch(`${baseURL}/cantidad_encuestas_completadas?id_materia=${materiaId}&anio=${anio}&periodo=${periodo}`);
                if (!resCant.ok) throw new Error(`Error Cantidad: ${resCant.status}`);
                setTotalEncuestas(await resCant.json());

            } catch (e) { 
                console.error("Fallo en carga de datos:", e); 
                setError(true); 
            } 
            finally { setLoading(false); }
        };
        cargarTodo();
    }, [materiaId, anio, periodo]);

    if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary"/></div>;
    
    if (error) return (
        <div className="alert alert-warning">
            Error al cargar datos. <br/>
            <small>Revisa la consola (F12) para ver qué endpoint falló.</small>
        </div>
    );
    
    if (!datos || !datos.promedio_por_categoria.length) return <div className="alert alert-light border p-4 text-center">Sin datos.</div>;

    return (
        <div className="card shadow-sm border-0 animate__animated animate__fadeIn">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h6 className="mb-0 fw-bold text-primary">Resultados de Encuestas</h6>
                <span className="badge bg-light text-dark border">Ciclo {anio} - {periodo}</span>
            </div>
            
            <div className="card-body p-4">
                <div className="row mb-5 align-items-center">
                    <div className="col-md-4 text-center border-end">
                        <h6 className="text-muted small fw-bold mb-3">PARTICIPACIÓN</h6>
                        <GraficoParticipacion completadas={totalEncuestas} totalAlumnos={inscriptos} />
                        <div className="mt-3 small text-muted">
                            <strong>{totalEncuestas}</strong> de <strong>{inscriptos}</strong> alumnos
                        </div>
                    </div>

                    <div className="col-md-8 ps-md-5">
                        <h6 className="text-muted small fw-bold mb-3">RENDIMIENTO POR CATEGORÍA</h6>
                        <div style={{ height: '220px', width: '100%' }}>
                            <GraficoBarrasEstadisticas datosApi={datos.promedio_por_categoria} />
                        </div>
                    </div>
                </div>
                <hr className="my-5" />
                <h5 className="mb-4 fw-bold text-secondary">Desglose Detallado por Categoría</h5>
                
                <div className="accordion accordion-flush border rounded" id="accDetalleMateria">
                    {datos.promedio_por_categoria.map((cat, i) => (
                        <div className="accordion-item border-bottom" key={i}>
                            <h2 className="accordion-header">
                                <button 
                                    className="accordion-button collapsed fw-bold text-dark bg-light" 
                                    type="button" 
                                    data-bs-toggle="collapse" 
                                    data-bs-target={`#cat-${i}`}
                                >
                                    {cat.categoria_cod} - {cat.categoria_texto}
                                </button>
                            </h2>
                            <div id={`cat-${i}`} className="accordion-collapse collapse" data-bs-parent="#accDetalleMateria">
                                <div className="accordion-body bg-white">
                                        <div className="mb-4 p-3 bg-light rounded border">
                                            <h6 className="fw-bold small text-muted mb-2">PROMEDIO DE LA CATEGORÍA</h6>
                                            <div className="d-flex gap-4">
                                                {cat.promedio_categoria.map((op, idx) => (
                                                    <div key={idx} className="d-flex align-items-center">
                                                        <span 
                                                            className="d-inline-block rounded-circle me-2" 
                                                            style={{
                                                                width: '10px', height: '10px',
                                                                backgroundColor: op.opcion_id.includes('Si') ? '#4BC0C0' : (op.opcion_id.includes('No') ? '#FF6384' : '#FFCE56')
                                                            }}
                                                        ></span>
                                                        <span className="fw-bold me-1">{op.opcion_id}:</span>
                                                        <span>{op.porcentaje.toFixed(1)}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>


                                    <div className="accordion mt-3" id={`accDetalleExtra-${i}`}>
                                        <div className="accordion-item">
                                            <h2 className="accordion-header">
                                                <button
                                                    className="accordion-button collapsed fw-bold text-dark"
                                                    type="button"
                                                    data-bs-toggle="collapse"
                                                    data-bs-target={`#detalleExtra-${i}`}
                                                >
                                                    Ver más detalles
                                                </button>
                                            </h2>

                                            <div
                                                id={`detalleExtra-${i}`}
                                                className="accordion-collapse collapse"
                                                data-bs-parent={`#accDetalleExtra-${i}`}
                                            >
                                                <div className="accordion-body">
                                                    {cat.preguntas && cat.preguntas.length > 0 && (
                                                        <div className="mt-3">
                                                            {cat.preguntas.map((preg, j) => (
                                                                <div key={j} className="mb-4 p-3 border rounded bg-light">
                                                                    <h6 className="fw-bold mb-3">
                                                                        Pregunta {preg.id_pregunta}
                                                                    </h6>

                                                                    {preg.datos.map((op, k) => (
                                                                        <div 
                                                                            key={k}
                                                                            className="d-flex align-items-center mb-2"
                                                                            style={{ fontSize: '0.85rem' }}
                                                                        >
                                                                            <div style={{ width: '40px' }} className="fw-bold text-dark">
                                                                                {op.opcion_id}
                                                                            </div>

                                                                            <div className="flex-grow-1 mx-3">
                                                                                <div className="progress" style={{ height: '12px' }}>
                                                                                    <div
                                                                                        className="progress-bar rounded-pill"
                                                                                        role="progressbar"
                                                                                        style={{
                                                                                            width: `${op.porcentaje}%`,
                                                                                            backgroundColor: op.opcion_id.includes('Si')
                                                                                                ? '#4BC0C0'
                                                                                                : op.opcion_id.includes('No')
                                                                                                ? '#FF6384'
                                                                                                : '#FFCE56'
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            </div>

                                                                            <div style={{ width: '50px' }} className="text-end fw-bold text-muted">
                                                                                {op.porcentaje.toFixed(1)}%
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ))}
                                                        </div>
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