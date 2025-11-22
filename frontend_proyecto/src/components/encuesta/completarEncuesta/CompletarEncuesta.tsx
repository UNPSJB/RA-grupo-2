import { useEffect, useState, useRef, useMemo } from "react";
import PreguntasCategoria from "./Categoria";
import MensajeExito from "../../pregunta/preguntaCerrada/MensajeExito";
import { useNavigate, useLocation } from "react-router-dom";
import { ANIO_ACTUAL, PERIODO_ACTUAL } from "../../../constants";
import ROUTES from "../../../paths";
import type { Categoria, Materia } from "../../../types/types";

interface Respuesta {
  pregunta_id: number;
  opcion_id: number | null;
  texto_respuesta?: string | null;
}

interface PreguntaConMetadata {
  id: number;
  enunciado: string;
  obligatoria: boolean;
}

export default function CompletarEncuesta() {
  const location = useLocation();
  const navigate = useNavigate();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [respuestasGlobales, setRespuestasGlobales] = useState<Respuesta[]>([]);
  const [mapaPreguntas, setMapaPreguntas] = useState<Record<number, PreguntaConMetadata[]>>({});
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<React.ReactNode | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [materia, setMateria] = useState<Materia>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [maxStepReached, setMaxStepReached] = useState(0);

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

  const progresoVisual = useMemo(() => {
    if (totalSteps === 0) return 0;
    const pasoActual = maxStepReached + 1;
    const porcentaje = Math.round((pasoActual / totalSteps) * 100);
    return Math.min(100, Math.max(0, porcentaje));
  }, [maxStepReached, totalSteps]);

  const todasLasPreguntas = Object.values(mapaPreguntas).flat();

  const validarCategoriaActual = (): boolean => {
    setMensaje(null);
    if (categoriaActivaId === null) return true;

    const preguntasDeEstaCategoria = mapaPreguntas[categoriaActivaId] || [];
    if (preguntasDeEstaCategoria.length === 0 && !loading) return true;

    const faltantes: string[] = [];

    for (const p of preguntasDeEstaCategoria) {
      if (!p.obligatoria) continue;

      const respuesta = respuestasGlobales.find(r => r.pregunta_id === p.id);
      const tieneOpcion = respuesta?.opcion_id !== null && respuesta?.opcion_id !== undefined;
      const tieneTexto = respuesta?.texto_respuesta && respuesta.texto_respuesta.trim().length > 0;

      if (!tieneOpcion && !tieneTexto) {
        faltantes.push(p.enunciado);
      }
    }

    if (faltantes.length > 0) {
      setMensaje(
        <div className="alert alert-danger mb-3 shadow-sm border-danger">
          <div className="d-flex align-items-center fw-bold mb-2">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Para avanzar, complete las siguientes preguntas obligatorias:
          </div>
          <ul className="mb-0 ps-3 small">
            {faltantes.slice(0, 5).map((t, i) => <li key={i}>{t}</li>)}
            {faltantes.length > 5 && <li>... y {faltantes.length - 5} más.</li>}
          </ul>
        </div>
      );
      return false;
    }
    return true;
  };

  const validarTodoParaEnviar = (): boolean => {
    setMensaje(null);
    const faltantes: string[] = [];

    for (const p of todasLasPreguntas) {
      if (!p.obligatoria) continue;

      const respuesta = respuestasGlobales.find(r => r.pregunta_id === p.id);
      const tieneOpcion = respuesta?.opcion_id !== null && respuesta?.opcion_id !== undefined;
      const tieneTexto = respuesta?.texto_respuesta && respuesta.texto_respuesta.trim().length > 0;

      if (!tieneOpcion && !tieneTexto) {
        faltantes.push(p.enunciado);
      }
    }

    if (faltantes.length > 0) {
      setMensaje(
        <div className="alert alert-danger mb-3 shadow-sm border-danger">
          <div className="d-flex align-items-center fw-bold mb-2">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Encuesta incompleta. Faltan las siguientes preguntas obligatorias:
          </div>
          <ul className="mb-0 ps-3 small">
            {faltantes.slice(0, 5).map((t, i) => <li key={i}>{t}</li>)}
            {faltantes.length > 5 && <li>... y {faltantes.length - 5} más.</li>}
          </ul>
        </div>
      );
      return false;
    }
    return true;
  };

  const goToStep = (index: number) => {
    if (categorias[index]) {
      setCategoriaActivaId(categorias[index].id);
    }
  };

  const nextStep = () => {
    if (!validarCategoriaActual()) return;

    const nextIndex = currentStep + 1;
    setMaxStepReached(prev => Math.max(prev, nextIndex));
    
    goToStep(nextIndex);
  };

  const prevStep = () => {
    setMensaje(null);
    goToStep(currentStep - 1);
  };

  const handleTabClick = (idCategoria: number) => {
    const targetIndex = categorias.findIndex(c => c.id === idCategoria);

    // Navegación libre hacia atrás o en lo ya desbloqueado
    if (targetIndex <= maxStepReached) {
      setMensaje(null);
      setCategoriaActivaId(idCategoria);
      return;
    }

    // Avanzar al siguiente inmediato requiere validación
    if (targetIndex === maxStepReached + 1) {
      if (validarCategoriaActual()) {
        // BLINDAJE AQUÍ TAMBIÉN
        setMaxStepReached(prev => Math.max(prev, targetIndex));
        setCategoriaActivaId(idCategoria);
      }
    } else {
      setMensaje(<div className="alert alert-warning mb-3">No puede saltar categorías que aún no ha completado.</div>);
    }
  };

  const manejarCargaPreguntas = (catId: number, preguntas: PreguntaConMetadata[]) => {
    setMapaPreguntas((prev) => {
      const currentIds = prev[catId]?.map(p => p.id) || [];
      const newIds = preguntas.map(p => p.id);
      if (JSON.stringify(currentIds) === JSON.stringify(newIds)) return prev;
      return { ...prev, [catId]: preguntas };
    });
  };

  const manejarCambioRespuestas = (pregunta_id: number, opcion_id: number | null, texto?: string) => {
    setRespuestasGlobales((prev) => {
      const existentes = prev.filter((r) => r.pregunta_id !== pregunta_id);
      return [...existentes, { pregunta_id, opcion_id, texto_respuesta: texto ?? null }];
    });
  };

  const enviarEncuesta = async () => {
    if (!validarTodoParaEnviar()) return;
    setEnviando(true);
    setMensajeExito(null);
    const { alumnoId, encuestaId, materiaId } = location.state || {};
    const datos = {
      alumno_id: alumnoId,
      encuesta_id: encuestaId,
      materia_id: materiaId,
      anio: ANIO_ACTUAL,
      periodo: PERIODO_ACTUAL,
      respuestas: respuestasGlobales.filter(r => r.opcion_id !== null || (r.texto_respuesta && r.texto_respuesta.trim() !== "")),
    };

    try {
      const res = await fetch('http://localhost:8000/encuesta-completada/con-respuestas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      if (!res.ok) throw new Error('Error al enviar encuesta');
      setMensajeExito('¡La encuesta fue completada con éxito!');
      setRespuestasGlobales([]);
    } catch (err) {
      console.error(err);
      setMensaje(<div className="alert alert-danger mb-3"><i className="bi bi-wifi-off me-2"></i> Error al enviar.</div>);
    } finally {
      setEnviando(false);
    }
  };

  function cerrarPagina() {
    setMensajeExito(null);
    navigate(ROUTES.ENCUESTAS_DISPONIBLES);
  }

  useEffect(() => {
    if (scrollRef.current) {
      const activeElement = scrollRef.current.querySelector('.nav-item a.active');
      if (activeElement instanceof HTMLElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentStep, categorias]);

  const handleMouseDown = (e: React.MouseEvent) => { if (scrollRef.current) { setIsDragging(true); e.preventDefault(); setStartX(e.pageX - scrollRef.current.offsetLeft); setScrollLeft(scrollRef.current.scrollLeft); }};
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => { if (!isDragging || !scrollRef.current) return; const x = e.pageX - scrollRef.current.offsetLeft; const walk = (x - startX) * 1.5; scrollRef.current.scrollLeft = scrollLeft - walk; };

  useEffect(() => {
    const { materiaId, encuestaId = 1 } = location.state || {};
    if (materiaId) fetch(`http://127.0.0.1:8000/materias/${materiaId}`).then(res => res.json()).then(setMateria).catch(console.error);
    setLoading(true);
    fetch(`http://localhost:8000/encuestas/${encuestaId}/categorias`)
      .then((res) => res.json())
      .then((todas: Categoria[]) => {
        const dataOrdenada = [...todas].sort((a, b) => a.cod.localeCompare(b.cod, 'es', { sensitivity: 'base' }));
        setCategorias(dataOrdenada);
        if (dataOrdenada.length > 0) setCategoriaActivaId(dataOrdenada[0].id);
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, [location.state]);

  if (loading) return <div className="d-flex justify-content-center py-4"><div className="spinner-border text-primary"></div></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (mensajeExito) return <MensajeExito mensaje={mensajeExito} onClose={cerrarPagina} />;

  return (
    <div className="bg-light" style={{ minHeight: '100vh' }}>
      <div className="container-lg py-4">
        <div className="card shadow-sm border-0 rounded-3">
          <div className="card-header bg-unpsjb-header">
            <h1 className="h4 mb-0 text-center">Encuesta {materia ? `- ${materia.nombre}` : ""}</h1>
          </div>

          <div className="card-body p-4 p-md-5">
            
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="badge bg-primary rounded-pill">{progresoVisual}% Completado</span>
              </div>
              <div className="progress" style={{ height: "8px", backgroundColor: "#e9ecef" }}>
                <div 
                    className="progress-bar bg-success" 
                    role="progressbar" 
                    style={{ width: `${progresoVisual}%`, transition: "width 0.5s ease" }} 
                    aria-valuenow={progresoVisual} 
                    aria-valuemin={0} 
                    aria-valuemax={100}
                ></div>
              </div>
            </div>

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
                    cursor: default;
                }
                
                .nav-pills-scrollable { display: flex; flex-wrap: nowrap; width: fit-content; }
              `}
            </style>

            <div ref={scrollRef} className={`horizontal-scroll-hidden mb-4 ${isDragging ? 'is-dragging' : ''}`} style={{ overflowX: 'auto', whiteSpace: 'nowrap', cursor: isDragging ? 'grabbing' : 'grab' }} onMouseDown={handleMouseDown} onMouseLeave={handleMouseLeave} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}>
              <ul className="nav nav-pills mb-0 nav-pills-scrollable">
                {categorias.map((categoria, index) => {
                    const isUnlocked = index <= maxStepReached;
                    const isActive = categoria.id === categoriaActivaId;

                    return (
                        <li key={categoria.id} className="nav-item">
                            <a 
                                className={`nav-link ${isActive ? 'active' : ''} ${isUnlocked ? 'unlocked' : ''}`} 
                                href="#" 
                                onClick={(e) => { 
                                    e.preventDefault(); 
                                    handleTabClick(categoria.id); 
                                }}
                            >
                            {`${categoria.cod}: ${categoria.texto}`}
                            </a>
                        </li>
                    );
                })}
              </ul>
            </div>

            <div className="step-content-container" style={{ overflowY: 'auto', paddingRight: '15px' }}>
              {categorias.map((c) => (
                <div key={c.id} style={{ display: c.id === categoriaActivaId ? 'block' : 'none' }}>
                  <PreguntasCategoria
                    categoria={c}
                    onRespuesta={manejarCambioRespuestas}
                    onQuestionsLoaded={manejarCargaPreguntas}
                    respuestasGlobales={respuestasGlobales}
                  />
                </div>
              ))}
            </div>

          </div>

          <div className="card-footer bg-white border-0 rounded-bottom-3 p-4">
            {mensaje && <div className="mb-3">{mensaje}</div>}

            <div className="d-flex justify-content-between">
              {/* type="button" es crucial para evitar recargas accidentales */}
              <button 
                type="button"
                onClick={prevStep} 
                className="btn btn-outline-secondary rounded-pill px-4"
                disabled={isFirstStep}
                style={{ visibility: isFirstStep ? 'hidden' : 'visible' }}
              >
                Anterior
              </button>

              {isLastStep ? (
                <button 
                type="button"
                onClick={enviarEncuesta} 
                className="btn btn-success rounded-pill px-4 shadow-sm"
                disabled={enviando}>{enviando ? 'Enviando...' : 'Enviar Encuesta'}</button>
              ) : (
                <button type="button" onClick={nextStep} className="btn btn-primary rounded-pill px-4">
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