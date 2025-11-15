import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchInforme, fetchPreguntasBase } from "./informesService"; 
import type { InformeCompletado, Pregunta } from "../../../types/types"; 
import ContenidoInformeSintetico from "./ContenidoPasosSinteticos"; 
import ROUTES from "../../../paths";
const syntheticSteps = [
    { name: 'Datos Generales', cod: '0' },
    { name: '1. Recursos', cod: '1' },
    { name: '2. Horas/Justificación', cod: '2' },
    { name: '2.A. Contenidos', cod: '2.A' },
    { name: '2.B. Encuestas', cod: '2.B' },
    { name: '2.C. Reflexión', cod: '2.C' },
    { name: '3. Actividades del Equipo', cod: '3' },
    { name: '4. Valoración', cod: '4' },
    { name: '5. Observaciones', cod: '5' },
];

export function mostrarPeriodo(periodo: string) {
    switch (periodo) {
        case "PRIMER_CUATRI": return "Primer Cuatrimestre";
        case "SEGUNDO_CUATRI": return "Segundo Cuatrimestre";
        case "ANUAL": return "Anual";
        default: return periodo;
    }
}

function InformeSinteticoDetail() {
    const { id } = useParams<{ id: string }>();
    const [informe, setInforme] = useState<InformeCompletado | null>(null); 
    const [preguntasBase, setPreguntasBase] = useState<Pregunta[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(0); 

    const preguntasOrdenadas = useMemo(() => {
        return [...preguntasBase].sort((a, b) => a.orden - b.orden);
    }, [preguntasBase]);

    useEffect(() => {
        if (!id) {
            setError("ID de informe no proporcionado");
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const dataInforme: InformeCompletado = await fetchInforme(id);
                setInforme(dataInforme);

                const dataPreguntas: Pregunta[] = await fetchPreguntasBase(dataInforme.informe_base_id);
                setPreguntasBase(dataPreguntas);
                
                if (dataPreguntas.length > 0) {
                    setCurrentStep(0);
                }
                
            } catch (err: any) {
                console.error(err);
                setError(err.message || "Error al cargar los datos del informe.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);
    
    const preguntaActual = preguntasOrdenadas[currentStep];

    if (loading || error || !informe) return (
        <div className="container py-4">
            {loading ? <p>Cargando...</p> : <div className="alert alert-danger">{error || "Informe no encontrado."}</div>}
        </div>
    );

    return (
        <div className="bg-light min-vh-100 py-4">
            <div className="container-lg">
                <div className="card shadow-sm border-0 rounded-3">
                    
                    <style>
                        {`
                            .horizontal-scroll-hidden::-webkit-scrollbar { display: none; }
                            .horizontal-scroll-hidden { -ms-overflow-style: none; scrollbar-width: none; }
                            
                            .nav-pills .nav-item .nav-link {
                                border-radius: 0;
                                color: #6c757d; 
                                font-weight: 500;
                            }
                            .nav-pills .nav-item .nav-link.active-tab-custom {
                                background-color: white !important; 
                                color: #007bff !important; 
                                border-bottom: 2px solid #007bff; 
                            }
                        `}
                    </style>
                    <div className="card-header bg-unpsjb-header text-center rounded-top-3">
                        <h1 className="h4 mb-0 text-white">{informe.titulo}</h1>
                    </div>
                    <div className="card-body p-0">
                        <div className="bg-white border-bottom shadow-sm"> 
                            
                            <div 
                                className="horizontal-scroll-hidden" 
                                style={{ overflowX: 'auto', whiteSpace: 'nowrap', marginBottom: '0px' }}
                            >
                                <ul className="nav nav-pills mb-0 d-inline-flex mx-3">
                                    {syntheticSteps.map((step, index) => {
                                        const isStepValid = preguntasOrdenadas[index]; 
                                        
                                        return (
                                            <li key={step.cod} className="nav-item">
                                                <a
                                                    className={`nav-link border-0 fw-normal py-2 px-3 tab-link-custom ${
                                                        currentStep === index 
                                                            ? "active-tab-custom" 
                                                            : "text-muted"
                                                    } ${!isStepValid ? 'disabled' : ''}`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (isStepValid) {
                                                            setCurrentStep(index);
                                                        }
                                                    }}
                                                    href="#"
                                                    title={step.name}
                                                    style={{ 
                                                        cursor: isStepValid ? "pointer" : "default",
                                                        marginRight: '8px', 
                                                    }} 
                                                >
                                                    {step.name}
                                                </a>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                        <div className="p-4 p-md-5 pt-4" style={{ 
                            height: '55vh', 
                            overflowY: 'auto' 
                        }}> 
                            {preguntaActual ? (
                                <ContenidoInformeSintetico
                                    pregunta={preguntaActual}
                                    todasLasRespuestas={informe.respuestas}
                                />
                            ) : (
                                 <div className="alert alert-warning">No hay contenido para este paso.</div>
                            )}
                        </div>
                    </div>
                    <div className="card-footer bg-white border-0 rounded-bottom-3 p-4">
                        <div className="d-flex justify-content-between">
                            <Link
                                to={ROUTES.INFORMES_SINTETICOS}
                                className="btn btn-outline-secondary rounded-pill px-4"
                            >
                                Volver al listado
                            </Link>
                            
                            <button
                                className="btn btn-outline-secondary rounded-pill px-4"
                                onClick={() => setCurrentStep(currentStep - 1)}
                                disabled={currentStep === 0}
                            >
                                Anterior
                            </button>
                            
                            <button
                                className="btn btn-primary rounded-pill px-4"
                                onClick={() => setCurrentStep(currentStep + 1)}
                                disabled={currentStep === preguntasOrdenadas.length - 1}
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InformeSinteticoDetail;