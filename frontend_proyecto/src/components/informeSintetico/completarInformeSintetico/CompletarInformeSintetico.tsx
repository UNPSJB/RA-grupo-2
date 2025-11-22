import { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
import type { Pregunta, Respuesta } from "../../../types/types";
import DesempenoAuxiliares from "./Pregunta4";
import ObservacionesComentarios from "./Pregunta5";

const TABS_MAP = new Map([
    ["0", "Datos Generales"], ["1", "1. Recursos"], ["2", "2. Horas/Justificación"],
    ["2.A", "2.A. Contenidos"], ["2.B", "2.B. Encuestas"], ["2.C", "2.C. Reflexión"],
    ["3", "3. Actividades del Equipo"], ["4", "4. Valoración"], ["5", "5. Observaciones"],
]);

function escribirPeriodo(p: string) {
    switch (p) {
        case "PRIMER_CUATRI": return "Primer Cuatrimestre";
        case "SEGUNDO_CUATRI": return "Segundo Cuatrimestre";
    }
}

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

    const [maxPasoAlcanzadoIndex, setMaxPasoAlcanzadoIndex] = useState(0);
    const [pasoValido, setPasoValido] = useState(true);

    const scrollRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const {
        dpto = { id: 1, nombre: "dpto informatica" },
        carrera = { id: 1, nombre: "APU" },
        anio = 2025,
        periodo = "SEGUNDO_CUATRI",
        informeBaseId = 1,
    } = location.state || {};

    const currentStepIndex = useMemo(() => {
        if (preguntaActivaId === null) return 0;
        const index = preguntas.findIndex(p => p.id === preguntaActivaId);
        return index === -1 ? 0 : index;
    }, [preguntaActivaId, preguntas]);

    const totalSteps = preguntas.length;
    const isLastStep = currentStepIndex === totalSteps - 1;
    const isFirstStep = currentStepIndex === 0;

    const progresoActual = useMemo(() => {
        if (totalSteps === 0) return 0;
        const pasoActual = maxPasoAlcanzadoIndex + 1;
        return Math.round((pasoActual / totalSteps) * 100);
    }, [maxPasoAlcanzadoIndex, totalSteps]);

    useEffect(() => {
        if (!dpto || !carrera || !informeBaseId) {
            setError("Se requiere información de contexto.");
            setLoading(false);
            return;
        }
        fetch(`http://127.0.0.1:8000/informes_sinteticos_base/${informeBaseId}/preguntas`)
            .then((res) => {
                if (!res.ok) throw new Error("No se pudo cargar las preguntas.");
                return res.json();
            })
            .then((data: Pregunta[]) => {
                const ordenadas = data.sort((a, b) => a.orden - b.orden);
                setPreguntas(ordenadas);
                if (ordenadas.length > 0 && preguntaActivaId === null) {
                    setPreguntaActivaId(ordenadas[0].id);
                }
            })
            .catch((err) => {
                console.error("Error:", err);
                setError(err.message);
            })
            .finally(() => setLoading(false));
    }, [informeBaseId]);

    useEffect(() => {
        if (scrollRef.current) {
            const activeElement = scrollRef.current.querySelector('.nav-item a.active');
            if (activeElement instanceof HTMLElement) {
                activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [currentStepIndex, preguntas]);

    const manejarCambio = useCallback((nuevasRespuestas: Respuesta[] | Respuesta) => {
        const respuestasArray = Array.isArray(nuevasRespuestas) ? nuevasRespuestas : [nuevasRespuestas];
        setRespuestas((prev) => {
            const actualizadas = prev.filter(
                (r) => !respuestasArray.some((n) => n.pregunta_id === r.pregunta_id && n.materia_id === r.materia_id)
            );
            return [...actualizadas, ...respuestasArray];
        });
    }, []);

    const notificarValidacion = useCallback((esValido: boolean) => {
        setPasoValido(esValido);
        if (esValido) setMensaje(null);
    }, []);

    const irAlPaso = (indexDestino: number) => {
        setMensaje(null);
        if (indexDestino < 0 || indexDestino >= preguntas.length) return;
        if (indexDestino > currentStepIndex) {
            if (!pasoValido) {
                setMensaje("Complete los campos obligatorios antes de continuar.");
                return;
            }
            if (indexDestino > maxPasoAlcanzadoIndex) {
                setMaxPasoAlcanzadoIndex(indexDestino);
            }
        }
        setPasoValido(true);
        setPreguntaActivaId(preguntas[indexDestino].id);
    };

    const nextStep = () => irAlPaso(currentStepIndex + 1);
    const prevStep = () => irAlPaso(currentStepIndex - 1);

    const enviarInforme = async () => {
        setEnviando(true);
        setMensaje(null);

        if (!pasoValido) {
            setMensaje("Hay errores en el formulario actual.");
            setEnviando(false);
            return;
        }

        const datosParaBackend = {
            titulo: `Informe ${carrera.nombre} ${anio}`,
            contenido: `Departamento: ${dpto.nombre}. ${anio}, ${escribirPeriodo(periodo)}`,
            anio: ANIO_ACTUAL,
            periodo: periodo,
            informe_base_id: informeBaseId,
            carrera_id: carrera.id,
            respuestas: respuestas,
        };

        const pregunta5 = preguntas.find(p => p.cod === "5");
        const respuesta5 = respuestas.find(r => r.pregunta_id === pregunta5?.id);

        if (!respuesta5 || !JSON.parse(respuesta5.texto_respuesta).observaciones_comentarios?.trim()) {
            setMensaje("Debe completar las observaciones antes de enviar el informe.");
            setEnviando(false);
            return;
        }

        try {
            const res = await fetch(
                "http://127.0.0.1:8000/informes_sinteticos_completados/completados/",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(datosParaBackend),
                }
            );
            if (!res.ok) throw new Error("Error al enviar el informe");

            setMensaje("¡Informe enviado con éxito!");
            setTimeout(() => {
                navigate(ROUTES.CARRERAS_DPTO(dpto.id));
            }, 2000);
        } catch (err: Error | unknown) {
            setMensaje(`Error: ${(err as Error).message}`);
        } finally {
            setEnviando(false);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => { if (scrollRef.current) { setIsDragging(true); e.preventDefault(); setStartX(e.pageX - scrollRef.current.offsetLeft); setScrollLeft(scrollRef.current.scrollLeft); } };
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseLeave = () => setIsDragging(false);
    const handleMouseMove = (e: React.MouseEvent) => { if (!isDragging || !scrollRef.current) return; const x = e.pageX - scrollRef.current.offsetLeft; const walk = (x - startX) * 1.5; scrollRef.current.scrollLeft = scrollLeft - walk; };

    if (loading) return <div className="d-flex justify-content-center p-5"><div className="spinner-border text-primary"></div></div>;
    if (error) return <div className="alert alert-danger m-3">{error}</div>;

    const renderPregunta = (pregunta: Pregunta) => {
        const commonProps = {
            departamentoId: dpto.id,
            carreraId: carrera.id,
            pregunta,
            anio,
            periodo,
            manejarCambio,
            notificarValidacion
        };
        const legacyProps = {
            id_dpto: dpto.id,
            id_carrera: carrera.id,
            pregunta,
            anio,
            periodo,
            manejarCambio,
            notificarValidacion
        };

        if (pregunta.cod === "0") return <InformacionGeneral {...legacyProps} />;
        if (pregunta.cod === "1") return <EquipamientoBibliografia {...commonProps} />;
        if (pregunta.cod === "2") return <Pregunta2 {...commonProps} />;
        if (pregunta.cod === "2.A") return <ContenidosAlcanzados {...legacyProps} />;
        if (pregunta.cod === "2.B") return <Pregunta2B {...commonProps} />;
        if (pregunta.cod === "2.C") return <Pregunta2C {...commonProps} />;
        if (pregunta.cod === "3") return <ActividadesDocentes {...legacyProps} />;
        if (pregunta.cod === "4") return <DesempenoAuxiliares {...commonProps} />;
        if (pregunta.cod === "5") return <ObservacionesComentarios pregunta={pregunta} manejarCambio={manejarCambio} />;

        return <div className="alert alert-secondary">Sin componente.</div>;
    };

    return (
        <div className="bg-light">
            <div className="container-lg py-4">
                <div className="card shadow-sm border-0 rounded-3">
                    <div className="card-header bg-unpsjb-header">
                        <h1 className="h4 mb-0 text-center text-white">Informe Sintético – {carrera.nombre}</h1>
                    </div>
                    <div className="card-body p-4 p-md-5">
                        <div className="mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <small className="text-muted text-uppercase fw-bold">Progreso</small>
                                <small className={`fw-bold ${!pasoValido ? "text-danger" : "text-primary"}`}>{progresoActual}%</small>
                            </div>
                            <div className="progress" style={{ height: "6px" }}>
                                <div className={`progress-bar ${!pasoValido ? "bg-danger" : "bg-primary"}`} style={{ width: `${progresoActual}%`, transition: "width 0.5s ease" }}></div>
                            </div>
                        </div>

                        <style>{`.horizontal-scroll-hidden::-webkit-scrollbar { display: none; } .horizontal-scroll-hidden { -ms-overflow-style: none; scrollbar-width: none; } .is-dragging { cursor: grabbing !important; } .nav-pills .nav-item { flex-shrink: 0; } .nav-pills .nav-item .nav-link { background-color: transparent !important; color: #212529 !important; font-weight: 500; border: none; padding: 0.5rem 2rem; margin-right: 0px; opacity: 1; white-space: nowrap; border-radius: 0; } .nav-pills .nav-item .nav-link.active { background-color: var(--color-unpsjb-blue) !important; color: white !important; border: none; opacity: 1; border-radius: 5px !important; } .nav-pills .nav-item .nav-link.disabled-tab { color: #adb5bd !important; cursor: pointer !important; } .nav-pills .nav-item .nav-link:not(.active):not(.disabled-tab):hover { color: black !important; } .nav-pills-scrollable { display: flex; flex-wrap: nowrap; width: fit-content; }`}</style>

                        <div ref={scrollRef} className={`horizontal-scroll-hidden mb-4 ${isDragging ? 'is-dragging' : ''}`} style={{ overflowX: 'auto' }} onMouseDown={handleMouseDown} onMouseLeave={handleMouseLeave} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}>
                            <ul className="nav nav-pills mb-0 nav-pills-scrollable">
                                {preguntas.map((p, idx) => {
                                    const isLocked = idx > maxPasoAlcanzadoIndex;
                                    return (
                                        <li key={p.id} className="nav-item">
                                            <a className={`nav-link ${p.id === preguntaActivaId ? "active" : ""} ${isLocked ? "disabled-tab" : ""}`} href="#" onClick={(e) => { e.preventDefault(); irAlPaso(idx); }}>
                                                {TABS_MAP.get(p.cod) || p.cod}
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        <div className="step-content-container" style={{ overflowY: "auto", paddingRight: "15px" }}>
                            {preguntas.map((p) => (
                                <div key={p.id} style={{ display: p.id === preguntaActivaId ? "block" : "none" }}>
                                    {renderPregunta(p)}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card-footer bg-white border-0 rounded-bottom-3 p-4">
                        <div className="d-flex justify-content-between">
                            {!isFirstStep && <button onClick={prevStep} className="btn btn-outline-secondary rounded-pill px-4">Anterior</button>}
                            {isFirstStep && <div />}
                            {isLastStep ? (
                                <button onClick={enviarInforme} className="btn btn-success rounded-pill px-4 shadow-sm" disabled={enviando}>{enviando ? "Enviando..." : "Enviar Informe"}</button>
                            ) : (
                                <button onClick={nextStep} className="btn btn-primary rounded-pill px-4">Siguiente</button>
                            )}
                        </div>
                        {mensaje && <div className={`mt-4 alert ${mensaje.includes("éxito") ? "alert-success" : "alert-danger"}`}>{mensaje}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}