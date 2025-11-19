import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import PreguntasCategoria from "./Categoria";
import MensajeExito from "../../pregunta/preguntaCerrada/MensajeExito";
import { useNavigate, useLocation } from "react-router-dom";
import { ANIO_ACTUAL, PERIODO_ACTUAL } from "../../../constants";
import ROUTES from "../../../paths";
import type { Categoria } from "../../../types/types";
import type { Materia } from "../../../types/types.ts";

interface Respuesta {
    pregunta_id: number;
    opcion_id: number | null;
    texto_respuesta?: string | null;
}

interface Pregunta {
    id: number;
    enunciado: string;
    categoria_id: number;
    encuesta_id: number;
    tipo: "cerrada" | "abierta" | "tabla"; 
    obligatoria: boolean;
}

export default function CompletarEncuesta() {
    const location = useLocation();
    const navigate = useNavigate();

    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [allPreguntas, setAllPreguntas] = useState<Pregunta[]>([]);
    const [respuestasGlobales, setRespuestasGlobales] = useState<Respuesta[]>([]);
    const [enviando, setEnviando] = useState(false);
    const [mensaje, setMensaje] = useState<string | null>(null);
    const [mensajeExito, setMensajeExito] = useState<string | null>(null);
    const [materia, setMateria] = useState<Materia | undefined>();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const [categoriaActivaId, setCategoriaActivaId] = useState<number | null>(null);

    const currentStep = useMemo(() => {
        if (categoriaActivaId === null) return 0;
        const index = categorias.findIndex((c) => c.id === categoriaActivaId);
        return index === -1 ? 0 : index;
    }, [categoriaActivaId, categorias]);

    const totalSteps = categorias.length;
    const isLastStep = currentStep === totalSteps - 1;
    const isFirstStep = currentStep === 0;

    const goToStep = (index: number) => {
        if (categorias[index]) {
            setCategoriaActivaId(categorias[index].id);
        }
    };
    const nextStep = () => goToStep(currentStep + 1);
    const prevStep = () => goToStep(currentStep - 1);

    useEffect(() => {
        if (scrollRef.current) {
            const activeElement = scrollRef.current.querySelector('.nav-item button.active');
            if (activeElement instanceof HTMLElement) {
                activeElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center',
                });
            }
        }
    }, [currentStep, categorias]);

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
        const { materiaId } = location.state || {};
        
        if (materiaId) {
            fetch(`http://127.0.0.1:8000/materias/${materiaId}`)
            .then(res=>{
              if (!res.ok) throw new Error("Error al obtener la materia");
                return res.json();
            })
            .then(setMateria)
            .catch(console.error);
        }

        const { encuestaId = 1 } = location.state || {};
        setLoading(true);
        setError(null);

        fetch(`http://localhost:8000/encuestas/${encuestaId}/categorias`)
            .then((res) => {
                if (!res.ok) throw new Error('No se pudieron cargar las categorías.');
                return res.json();
            })
            .then((todas: Categoria[]) => {
                const dataOrdenada = [...todas].sort((a, b) =>
                    a.cod.localeCompare(b.cod, 'es', { sensitivity: 'base' })
                );
                setCategorias(dataOrdenada);
                if (dataOrdenada.length > 0) setCategoriaActivaId(dataOrdenada[0].id);
            })
            .catch((err) => {
                console.error('Error al obtener categorías:', err);
                setError((err as Error).message || 'Error desconocido');
            })
            .finally(() => setLoading(false));
    }, [location.state]);

    const manejarCambioRespuestas = useCallback(
        (pregunta_id: number, opcion_id: number | null, texto?: string | null) => {
            setRespuestasGlobales((prev) => {
                const existentes = prev.filter((r) => r.pregunta_id !== pregunta_id);
                
                if (opcion_id === null && (!texto || texto.trim() === '')) {
                    return existentes;
                }

                return [
                    ...existentes,
                    { pregunta_id, opcion_id, texto_respuesta: texto ?? null },
                ];
            });
        },
        []
    );

    const handlePreguntasCargadas = useCallback((nuevasPreguntas: Pregunta[]) => {
        setAllPreguntas((prev) => {
            const preguntasMap = new Map(prev.map((p) => [p.id, p]));
            nuevasPreguntas.forEach((p) => preguntasMap.set(p.id, p));
            return Array.from(preguntasMap.values());
        });
    }, []); 

    const enviarEncuesta = async () => {
        const preguntasObligatorias = allPreguntas.filter((p) => p.obligatoria);
        
        const idRespuestasDadas = new Set(
            respuestasGlobales
                .filter(
                    (r) =>
                        r.opcion_id !== null ||
                        (r.texto_respuesta && r.texto_respuesta.trim() !== "")
                )
                .map((r) => r.pregunta_id)
        );

        const primeraFaltante = preguntasObligatorias.find(
            (p) => !idRespuestasDadas.has(p.id)
        );

        if (primeraFaltante) {
            setMensaje(
                `Debes responder todas las preguntas obligatorias. Falta: "${primeraFaltante.enunciado}"`
            );
            return;
        }

        setEnviando(true);
        setMensaje(null);

        const { alumnoId, encuestaId, materiaId } = location.state || {};

        if (!alumnoId || !encuestaId || !materiaId) {
            console.error("Faltan parámetros:", location.state);
            setMensaje("Error: No se pudieron cargar los datos de la encuesta");
            setEnviando(false);
            return;
        }

        const datos = {
            alumno_id: alumnoId,
            encuesta_id: encuestaId,
            materia_id: materiaId,
            anio: ANIO_ACTUAL,
            periodo: PERIODO_ACTUAL,
            respuestas: respuestasGlobales,
        };

        try {
            const res = await fetch('http://localhost:8000/encuesta-completada/con-respuestas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos),
            });

            const data = await res.json(); 

            if (!res.ok) { 
                throw new Error(data.detail || "Error desconocido desde el backend");
            }

            setMensaje('Encuesta enviada con éxito.');
            setMensajeExito('¡La encuesta fue completada con éxito!');
            setRespuestasGlobales([]);
        } catch (err) {
            console.error(err);
            setMensaje(err instanceof Error ? err.message : "Error al enviar la encuesta.");
        } finally {
            setEnviando(false);
        }
    };

    function cerrarPagina() {
        setMensajeExito(null);
        navigate(ROUTES.ENCUESTAS_DISPONIBLES);
    }

    const respuestasValidas = respuestasGlobales.filter(
        (r) =>
            r.opcion_id !== null ||
            (r.texto_respuesta && r.texto_respuesta.trim() !== "")
    ).length;

    const totalPreguntas = allPreguntas.length;

    const porcentaje =
        totalPreguntas > 0 ? (respuestasValidas / totalPreguntas) * 100 : 0;

    if (mensajeExito) {
        return <MensajeExito mensaje={mensajeExito} onClose={cerrarPagina} />;
    }

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-2">Cargando categorías y preguntas...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger">
                    Error crítico al cargar datos: **{error}**.
                </div>
                <button onClick={() => navigate(ROUTES.ENCUESTAS_DISPONIBLES)} className="btn btn-secondary">
                    Volver
                </button>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <div className="card border-0 shadow-lg">
                <div className="card-header bg-unpsjb-header">
                    <h1 className="h4 mb-0 text-center">Encuesta</h1>
                    {materia && (
                        <p className="text-center text-white small mb-0">Materia: **{materia.nombre}**</p>
                    )}
                </div>

                {totalPreguntas > 0 && (
                    <div className="sticky-top bg-light border-bottom p-2">
                        <h6 className="text-center text-muted small mb-1">
                            Progreso: **{respuestasValidas}** de **{totalPreguntas}** (**{porcentaje.toFixed(0)}%**)
                        </h6>
                        <div
                            className="progress"
                            style={{ height: "20px" }}
                            role="progressbar"
                            aria-valuenow={porcentaje}
                            aria-valuemin={0}
                            aria-valuemax={100}
                        >
                            <div
                                className="progress-bar fw-bold"
                                style={{ width: `${porcentaje}%` }}
                            >
                                {porcentaje.toFixed(0)}%
                            </div>
                        </div>
                    </div>
                )}

                <div className="card-body">
                    {/* Navegación por Pestañas Horizontal */}
                    <div
                        ref={scrollRef}
                        className="nav nav-tabs overflow-auto flex-nowrap mb-4"
                        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                        onMouseMove={handleMouseMove}
                    >
                        {categorias.map((categoria, index) => (
                            <li className="nav-item flex-shrink-0" key={categoria.id}>
                                <button
                                    className={`nav-link ${categoria.id === categoriaActivaId ? 'active' : ''}`}
                                    onClick={() => goToStep(index)}
                                    disabled={enviando}
                                >
                                    {categoria.cod}
                                </button>
                            </li>
                        ))}
                    </div>

                    {/* Contenido de la Categoría Activa */}
                    <div className="content-steps">
                        {categorias.map((categoria) => (
                            <div
                                className="step-content"
                                key={categoria.id}
                                style={{ display: categoria.id === categoriaActivaId ? 'block' : 'none' }}
                            >
                                <h5 className="mb-3">**{categoria.cod}: {categoria.texto}**</h5>
                                <p className="text-muted small">Responde las siguientes preguntas:</p>
                                <PreguntasCategoria
                                    categoria={categoria}
                                    onRespuesta={manejarCambioRespuestas}
                                    onPreguntasCargadas={handlePreguntasCargadas}
                                />
                            </div>
                        ))}
                    </div>

                    <hr />
                    {mensaje && (
                        <div
                            className={`mb-3 alert ${
                                mensaje.includes("éxito") ? "alert-success" : "alert-danger"
                            }`}
                        >
                            {mensaje}
                        </div>
                    )}
                    
                    {/* Botones de Navegación */}
                    <div className="text-center mt-4 d-flex justify-content-between">
                        <button
                            onClick={prevStep}
                            className="btn btn-outline-secondary px-4"
                            disabled={isFirstStep || enviando}
                        >
                            ← Anterior
                        </button>
                        
                        {isLastStep ? (
                            <button
                                onClick={enviarEncuesta}
                                className="btn btn-theme-primary rounded-pill px-4"
                                disabled={enviando || totalPreguntas === 0}
                            >
                                {enviando ? "Enviando..." : "Enviar Encuesta"}
                            </button>
                        ) : (
                            <button
                                onClick={nextStep}
                                className="btn btn-outline-primary px-4"
                                disabled={enviando}
                            >
                                Siguiente →
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}