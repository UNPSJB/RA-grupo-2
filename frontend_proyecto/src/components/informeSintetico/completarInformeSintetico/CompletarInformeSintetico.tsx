import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ANIO_ACTUAL } from "../../../constants";
import ROUTES from "../../../paths";
import Pregunta2B from "./Pregunta2B";
import InformacionGeneral from "./Pregunta0";
import ContenidosAlcanzados from "./Pregunta2A";
import Pregunta2C from "./Pregunta2C";
import Pregunta2 from "./Pregunta2";
import ActividadesDocentes from "./Pregunta3";
import EquipamientoBibliografia from "./Pregunta1"; 
import type {Pregunta, Respuesta} from "../../../types/types";
import DesempenoAuxiliares from "./Pregunta4"; 
import ObservacionesComentarios from "./Pregunta5"; 

const TABS_MAP = new Map([
    ["0", "Datos Generales"], ["1", "1. Recursos"], ["2", "2. Horas/Justificación"], 
    ["2.A", "2.A. Contenidos"], ["2.B", "2.B. Encuestas"], ["2.C", "2.C. Reflexión"], 
    ["3", "3. Actividades del Equipo"], ["4", "4. Valoración"], ["5", "5. Observaciones"],
]);

export default function CompletarInformeSintetico() {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [respuestas, setRespuestas] = useState<Respuesta[]>([]);
    const [enviando, setEnviando] = useState(false);
    const [mensaje, setMensaje] = useState<string | null>(null);
    const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
    const [preguntaActivaId, setPreguntaActivaId] = useState<number | null>(null);
    
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    
    const {
        dpto = { id: 1, nombre: "dpto informatica" },
        carrera = { id: 1, nombre: "APU" },
        anio = 2025,
        periodo = "PRIMER_CUATRI",
        informeBaseId = 1,
    } = location.state || {};

    const currentStep = useMemo(() => {
        if (preguntaActivaId === null) return 0;
        const index = preguntas.findIndex(p => p.id === preguntaActivaId);
        return index === -1 ? 0 : index;
    }, [preguntaActivaId, preguntas]);

    const totalSteps = preguntas.length;
    const isLastStep = currentStep === totalSteps - 1;
    const isFirstStep = currentStep === 0;

    const goToStep = (index: number) => {
        if (preguntas[index]) {
            setPreguntaActivaId(preguntas[index].id);
        }
    };
    const nextStep = () => {
        goToStep(currentStep + 1);
    };
    const prevStep = () => {
        goToStep(currentStep - 1);
    };

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
        if(!dpto || !carrera || !informeBaseId){
            setError("Se requiere información de contexto.");
            setLoading(false);
            return;
        }
        fetch(
            `http://127.0.0.1:8000/informes_sinteticos_base/${informeBaseId}/preguntas`
        )
            .then((res) => {
                if (!res.ok) throw new Error("No se pudo cargar la estructura del informe.");
                return res.json();
            })
            .then((data: Pregunta[]) => {
                const ordenadas = data.sort((a, b) => a.orden - b.orden);
                setPreguntas(ordenadas);
                if (ordenadas.length > 0) {
                    setPreguntaActivaId(ordenadas[0].id);
                }
            })
            .catch((err) => {
                console.error("Error fetching preguntas del informe:", err);
                setError(err.message);
            })
            .finally(() => setLoading(false));
    }, [informeBaseId]);

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
    }, [currentStep, preguntas]); 

    const manejarCambio = (nuevasRespuestas: Respuesta[] | Respuesta) => {
        const respuestasArray = Array.isArray(nuevasRespuestas)
            ? nuevasRespuestas
            : [nuevasRespuestas];

        setRespuestas((prev) => {
            const actualizadas = prev.filter(
                (r) =>
                    !respuestasArray.some(
                        (n) =>
                            n.pregunta_id === r.pregunta_id && n.materia_id === r.materia_id
                    )
            );
            return [...actualizadas, ...respuestasArray];
        });

        if (mensaje && mensaje.includes("complete")) setMensaje(null);
    };

    const enviarInforme = async () => {
        setEnviando(true);
        setMensaje(null);
        const datosParaBackend = {
            titulo: `Informe ${carrera.nombre} ${anio}`,
            contenido: `De ${dpto.nombre} (${periodo})`,
            anio: ANIO_ACTUAL,
            periodo: periodo,
            informe_base_id: informeBaseId,
            carrera_id: carrera.id,
            respuestas: respuestas,
        };

        try {
            const res = await fetch(
                "http://127.0.0.1:8000/informes_sinteticos_completados/completados/",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(datosParaBackend),
                }
            );
            if (!res.ok) {
                const errorData = await res
                    .json()
                    .catch(() => ({ detail: "Error desconocido al enviar." }));
                throw new Error(errorData.detail || "Error al enviar el informe");
            }
            setMensaje("¡Informe enviado con éxito!");
            setTimeout(() => {
                navigate(ROUTES.CARRERAS_DPTO(dpto.id));
            }, 2000);
        } catch (err: Error | unknown) {
            console.error("Error enviando informe:", err);
            setMensaje(`Error: ${(err as Error).message}`);
        } finally {
            setEnviando(false);
        }
    };

    if (!dpto?.nombre || !carrera?.nombre) {
        return (
            <div className="alert alert-danger">
                Error: No se encontró la información necesaria.
            </div>
        );
    }
    if (loading) {
        return (
            <div className="d-flex justify-content-center">
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }
    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    const renderPregunta = (pregunta: Pregunta) => {
         if (pregunta.cod=="1") { 
        return (
            <EquipamientoBibliografia 
                departamentoId={dpto.id}
                carreraId={carrera.id}
                pregunta={pregunta}
                anio={anio}
                periodo={periodo}
                manejarCambio={manejarCambio}
            />
        );
    }
        if (pregunta.cod=="2.B") {
            return (
                <Pregunta2B
                    departamentoId={dpto.id}
                    carreraId={carrera.id}
                    pregunta={pregunta}
                    anio={anio}
                    periodo={periodo}
                    manejarCambio={manejarCambio}
                />
            );
        }

        if (pregunta.cod=="2.C") {
            return (
                <Pregunta2C
                    departamentoId={dpto.id}
                    carreraId={carrera.id}
                    pregunta={pregunta}
                    anio={anio}
                    periodo={periodo}
                    manejarCambio={manejarCambio}
                />
            );
        }

        if (pregunta.cod=="0") {
            return (
                <InformacionGeneral
                    id_dpto={dpto.id}
                    id_carrera={carrera.id}
                    pregunta={pregunta}
                    anio={anio}
                    periodo={periodo}
                    manejarCambio={manejarCambio}
                />
            );
        }
        if (pregunta.cod=="2.A") {
            return (
                <ContenidosAlcanzados
                    id_dpto={dpto.id}
                    id_carrera={carrera.id}
                    pregunta={pregunta} 
                    anio={anio}
                    periodo={periodo}
                    manejarCambio={manejarCambio}
                />
            );
        }

        if (pregunta.cod=="2") {
            return (
                <Pregunta2
                    departamentoId={dpto.id}
                    carreraId={carrera.id}
                    pregunta={pregunta}
                    anio={anio}
                    periodo={periodo}
                    manejarCambio={manejarCambio}
                />
            );
        }
        if (pregunta.cod=="3") {
            return (
                <ActividadesDocentes
                    id_dpto={dpto.id}
                    id_carrera={carrera.id}
                    pregunta={pregunta} 
                    anio={anio}
                    periodo={periodo}
                    manejarCambio={manejarCambio}
                />
            );
        }
        if (pregunta.cod=="4") { 
            return (
                <DesempenoAuxiliares
                    departamentoId={dpto.id}
                    carreraId={carrera.id}
                    pregunta={pregunta}
                    anio={anio}
                    periodo={periodo}
                    manejarCambio={manejarCambio}
                />
            );
        }
        if (pregunta.cod=="5") { 
            return (
                <ObservacionesComentarios
                    pregunta={pregunta}
                    manejarCambio={manejarCambio} 
                />
            );
        }
        return (
            <div className="alert alert-secondary">
                Pregunta "{pregunta.enunciado}" sin componente asignado.
            </div>
        );
    };

    return (
        <div className="bg-light">
            <div className="container-lg py-4">
                <div className="card shadow-sm border-0 rounded-3">
                    <div className="card-header bg-unpsjb-header">
                        <h1 className="h4 mb-0 text-center">
                            Informe Sintético – {carrera.nombre}
                        </h1>
                    </div>

                    <div className="card-body p-4 p-md-5">
                        <style>
                          {`
                            .horizontal-scroll-hidden::-webkit-scrollbar { display: none; }
                            .horizontal-scroll-hidden { -ms-overflow-style: none; scrollbar-width: none; }
                            .is-dragging { cursor: grabbing !important; }
                            .nav-pills .nav-item { 
                                flex-shrink: 0; 
                            }
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
                                background-color: var(--color-unpsjb-blue) !important; 
                                color: white !important; 
                                border: none;
                                opacity: 1;
                                border-radius: 5px !important; 
                            }
                            .nav-pills .nav-item .nav-link:not(.active):hover {
                                color: black !important; 
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
                                {preguntas.map((p) => (
                                    <li key={p.id} className="nav-item">
                                        <a
                                            className={`nav-link ${p.id === preguntaActivaId ? "active" : "text-muted"}`}
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setPreguntaActivaId(p.id);
                                            }}
                                            style={{ cursor: "pointer", fontWeight: 500 }}
                                        >
                                            {TABS_MAP.get(p.cod) || p.cod} 
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div
                            className="step-content-container"
                            style={{
                                overflowY: "auto",
                                paddingRight: "15px",
                            }}
                        >
                            {preguntas.map((p) => (
                                <div
                                    key={p.id}
                                    style={{ display: p.id === preguntaActivaId ? "block" : "none" }}
                                >
                                    {renderPregunta(p)}
                                </div>
                            ))}
                        </div>

                    </div>

                    <div className="card-footer bg-white border-0 rounded-bottom-3 p-4">
                        <div className="d-flex justify-content-between">
                            {!isFirstStep && (
                                <button
                                    onClick={prevStep}
                                    className="btn btn-outline-secondary rounded-pill px-4"
                                >
                                    Anterior
                                </button>
                            )}
                            {isFirstStep && <div />}
                            {isLastStep ? (
                                <button
                                    onClick={enviarInforme}
                                    className="btn btn-success rounded-pill px-4 shadow-sm"
                                    disabled={enviando}
                                >
                                    {enviando ? "Enviando..." : "Enviar Informe"}
                                </button>
                            ) : (
                                <button
                                    onClick={nextStep}
                                    className="btn btn-primary rounded-pill px-4"
                                >
                                    Siguiente
                                </button>
                            )}
                        </div>

                        {mensaje && (
                            <div
                                className={`mt-4 alert ${mensaje.includes("éxito") ? "alert-success" : "alert-danger"}`}
                            >
                                {mensaje}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
