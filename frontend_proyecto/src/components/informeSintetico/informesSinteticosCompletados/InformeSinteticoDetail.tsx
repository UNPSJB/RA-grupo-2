import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchInforme, fetchPreguntasBase } from "./informesService"; 
import type { InformeCompletado, Pregunta } from "../../../types/types"; 
import ContenidoInformeSintetico from "./ContenidoPasosSinteticos"; 
import ROUTES from "../../../paths";

const TABS_MAP = new Map([
    ["0", "Datos Generales"], ["1", "1. Recursos"], ["2", "2. Horas/Justificación"], 
    ["2.A", "2.A. Contenidos"], ["2.B", "2.B. Encuestas"], ["2.C", "2.C. Reflexión"], 
    ["3", "3. Actividades del Equipo"], ["4", "4. Valoración"], ["5", "5. Observaciones"],
]);

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

    const scrollRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    
    const preguntasOrdenadas = useMemo(() => {
        if (preguntasBase.length === 0) return [];
        return [...preguntasBase].sort((a, b) => a.orden - b.orden);
    }, [preguntasBase]);
    
    const totalSteps = preguntasOrdenadas.length; 
    const isLastStep = totalSteps > 0 && currentStep === totalSteps - 1;
    const isFirstStep = currentStep === 0;

    const handleMouseDown = (e: React.MouseEvent) => {
        if (scrollRef.current) {
            setIsDragging(true);
            e.preventDefault(); 
            setStartX(e.pageX - scrollRef.current.offsetLeft);
            setScrollLeft(scrollRef.current.scrollLeft);
        }
    };
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseLeave = () => setIsDragging(false);
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollRef.current) return;
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 1.5; 
        scrollRef.current.scrollLeft = scrollLeft - walk;
    };

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
                if (dataPreguntas.length > 0) setCurrentStep(0);
            } catch (err: any) {
                console.error(err);
                setError(err.message || "Error al cargar los datos del informe.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);
    
    useEffect(() => {
        if (scrollRef.current) {
            const activeElement = scrollRef.current.querySelector('.nav-item a.active');
            if (activeElement instanceof HTMLElement) {
                activeElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }
        }
    }, [currentStep, preguntasOrdenadas]); 
    
    const preguntaActual = preguntasOrdenadas[currentStep];

    if (loading || error || !informe) return (
        <div className="container py-4">
            {loading ? <p>Cargando...</p> : <div className="alert alert-danger">{error || "Informe no encontrado."}</div>}
        </div>
    );

    return (
        <div className="bg-light"> 
            <div className="container-lg py-4">
                <div className="card shadow-sm border-0 rounded-3">
                    <div className="card-header bg-unpsjb-header text-center rounded-top-3">
                        <h1 className="h4 mb-0 text-white">{informe.titulo}</h1>
                    </div>
                    
                    <div className="card-body p-4 p-md-5"> 
                        <style>
                          {`
                            .horizontal-scroll-hidden::-webkit-scrollbar { display: none; }
                            .horizontal-scroll-hidden { -ms-overflow-style: none; scrollbar-width: none; }
                            .is-dragging { cursor: grabbing !important; }
                            .nav-pills .nav-item { flex-shrink: 0; }
                            .nav-pills .nav-item .nav-link { 
                                background-color: transparent !important; 
                                color: #212529 !important; 
                                font-weight: 500;
                                border: none;
                                padding: 0.5rem 2rem; 
                                margin-right: 0px; 
                                opacity: 1; 
                                white-space: nowrap; 
                                border-radius: 0; 
                            }
                            .nav-pills .nav-item .nav-link.active {
                                background-color: var(--color-unpsjb-blue, #005ec2) !important; 
                                color: white !important; 
                                border-radius: 5px !important; 
                            }
                            .nav-pills-scrollable { display: flex; flex-wrap: nowrap; width: fit-content; }
                          `}
                        </style>

                        <div 
                            ref={scrollRef} 
                            className={`horizontal-scroll-hidden mb-4 ${isDragging ? 'is-dragging' : ''}`}
                            style={{ overflowX: 'auto'}}
                            onMouseDown={handleMouseDown}
                            onMouseLeave={handleMouseLeave}
                            onMouseUp={handleMouseUp}
                            onMouseMove={handleMouseMove}
                        >
                            <ul className="nav nav-pills mb-0 nav-pills-scrollable" id="pills-tab" role="tablist">
                                {syntheticSteps.map((step, index) => {
                                    const pregunta = preguntasOrdenadas[index];
                                    const isStepValid = !!pregunta;
                                    
                                    return (
                                        <li key={step.cod} className="nav-item">
                                            <a
                                                className={`nav-link ${
                                                    currentStep === index 
                                                        ? "active" 
                                                        : "text-muted"
                                                } ${!isStepValid ? 'disabled' : ''}`}
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (isStepValid) {
                                                        setCurrentStep(index);
                                                    }
                                                }}
                                                style={{ cursor: isStepValid ? "pointer" : "default" }}
                                            >
                                                {TABS_MAP.get(pregunta?.cod || step.cod) || step.name}
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        <div
                            className="step-content-container"
                            style={{
                                overflowY: "auto",
                                paddingRight: "15px",
                                minHeight: '40vh',
                            }}
                        >
                            {preguntaActual ? (
                                <ContenidoInformeSintetico
                                    pregunta={preguntaActual}
                                    todasLasRespuestas={informe.respuestas}
                                />
                            ) : (
                                <div className="alert alert-warning">
                                    {totalSteps > 0 ? "No hay contenido para este paso." : "No se cargaron preguntas para este informe."}
                                </div>
                            )}
                        </div>

                    </div>
                    
                    <div className="card-footer bg-white border-0 rounded-bottom-3 p-4">
                        <div className="d-flex justify-content-between">
                            {!isFirstStep ? (
                                <button
                                    onClick={() => setCurrentStep(currentStep - 1)}
                                    className="btn btn-outline-secondary rounded-pill px-4"
                                >
                                    Anterior
                                </button>
                            ) : (
                                <div /> 
                            )}
                            
                            {isLastStep ? (
                                <Link
                                    to={ROUTES.INFORMES_SINTETICOS}
                                    className="btn btn-primary rounded-pill px-4" 
                                >
                                    Volver al listado
                                </Link>
                            ) : (
                                <button
                                    className="btn btn-primary rounded-pill px-4"
                                    onClick={() => setCurrentStep(currentStep + 1)}
                                    disabled={totalSteps === 0 || currentStep >= totalSteps - 1} 
                                >
                                    Siguiente
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InformeSinteticoDetail;
