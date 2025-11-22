// src/components/encuesta/completarEncuesta/CompletarEncuesta.tsx
import { useEffect, useState, useRef, useMemo } from "react";
import PreguntasCategoria from "./Categoria";
import MensajeExito from "../../pregunta/preguntaCerrada/MensajeExito";
import { useNavigate, useLocation } from "react-router-dom";
import { ANIO_ACTUAL, PERIODO_ACTUAL } from "../../../constants";
import ROUTES from "../../../paths";
import type { Categoria } from "../../../types/types";
import type { Materia } from "../../../types/types.ts";
// IMPORTAMOS NUESTRA INSTANCIA DE AXIOS
import api from "../../../services/api";
// IMPORTAMOS LOS TIPOS DE AXIOS PARA CORREGIR LOS ERRORES
import axios from "axios";
import type { AxiosError, AxiosResponse } from "axios";

interface Respuesta {
  pregunta_id: number;
  opcion_id: number | null;
  texto_respuesta?: string | null;
}

export default function CompletarEncuesta() {
  const location = useLocation();
  const navigate = useNavigate();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [respuestasGlobales, setRespuestasGlobales] = useState<Respuesta[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  
  // Corrección variable no usada: Ignoramos el primer elemento (materia)
  const [, setMateria] = useState<Materia>();

  const [preguntasPorCategoria, setPreguntasPorCategoria] = useState<Record<number, number>>({});

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
      const activeElement = scrollRef.current.querySelector('.nav-item a.active');
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
    const { encuestaId = 1 } = location.state || {};

    if (!materiaId) {
        console.error("Falta materiaId en location.state");
        setError("No se especificó la materia.");
        setLoading(false);
        return;
    }

    setLoading(true);
    setError(null);

    // GET Materia con tipos corregidos
    api.get<Materia>(`/materias/${materiaId}`)
      .then((res: AxiosResponse<Materia>) => { // Tipado explícito
        setMateria(res.data);
      })
      .catch((err: AxiosError) => { // Tipado explícito
        console.error("Error al obtener la materia:", err);
        setError("Error al cargar los datos de la materia.");
      });


    // GET Categorías con tipos corregidos
    api.get<Categoria[]>(`/encuestas/${encuestaId}/categorias`)
      .then((res: AxiosResponse<Categoria[]>) => { // Tipado explícito
        const todas = res.data;
        const dataOrdenada = [...todas].sort((a, b) =>
          a.cod.localeCompare(b.cod, 'es', { sensitivity: 'base' })
        );
        setCategorias(dataOrdenada);
        if (dataOrdenada.length > 0) setCategoriaActivaId(dataOrdenada[0].id);
      })
      .catch((err: AxiosError | Error) => { // Tipado explícito (puede ser de Axios o genérico)
        console.error('Error al obtener categorías:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido al cargar categorías');
      })
      .finally(() => setLoading(false));

  }, [location.state]);

  const manejarCambioRespuestas = (pregunta_id: number, opcion_id: number | null, texto?: string) => {
    setRespuestasGlobales((prev) => {
      const existentes = prev.filter((r) => r.pregunta_id !== pregunta_id);
      return [...existentes, { pregunta_id, opcion_id, texto_respuesta: texto ?? null }];
    });
  };

  const manejarTotalPreguntas = (categoriaId: number, cantidad: number) => {
    setPreguntasPorCategoria((prev) => ({ ...prev, [categoriaId]: cantidad }));
  };

  const totalPreguntas = Object.values(preguntasPorCategoria).reduce((a, b) => a + b, 0);

  const enviarEncuesta = async () => {
    if (respuestasGlobales.length < totalPreguntas) {
      setMensaje('Debes responder todas las preguntas antes de enviar.');
      return;
    }

    setEnviando(true);
    setMensaje(null);

    const { alumnoId, encuestaId, materiaId } = location.state || {};

    if (!alumnoId || !encuestaId || !materiaId) {
      console.error('Faltan parámetros:', location.state);
      setMensaje('Error: No se pudieron cargar los datos de la encuesta (faltan IDs)');
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
      // POST Enviar Encuesta
      await api.post('/encuesta-completada/con-respuestas', datos);

      setMensaje('Encuesta enviada con éxito.');
      setMensajeExito('¡La encuesta fue completada con éxito!');
      setRespuestasGlobales([]);
    } catch (err) {
      console.error(err);
      let errorMessage = 'Error al enviar la encuesta.';
      
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
      // -------------------------------------------------------
          errorMessage = err.response.data.detail;
      } else if (err instanceof Error) {
          errorMessage = err.message;
      }
      
      setMensaje(errorMessage);
    } finally {
      setEnviando(false);
    }
  };

  function cerrarPagina() {
    setMensajeExito(null);
    navigate(ROUTES.ENCUESTAS_DISPONIBLES);
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-4">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (mensajeExito) {
    return <MensajeExito mensaje={mensajeExito} onClose={cerrarPagina} />;
  }

  // Corrección variable no usada: Se eliminó 'const categoriaActiva = ...'

  return (
    <div className="bg-light">
      <div className="container-lg py-4">
        <div className="card shadow-sm border-0 rounded-3">
          <div className="card-header bg-unpsjb-header">
            <h1 className="h4 mb-0 text-center">Encuesta</h1>
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
              style={{ overflowX: 'auto' }}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
            >
              <ul className="nav nav-pills mb-0 nav-pills-scrollable" id="pills-tab" role="tablist">
                {categorias.map((categoria) => (
                  <li key={categoria.id} className="nav-item">
                    <a
                      className={`nav-link ${categoria.id === categoriaActivaId ? 'active' : 'text-muted'}`}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCategoriaActivaId(categoria.id);
                      }}
                      style={{ cursor: 'pointer', fontWeight: 500 }}
                    >
                      {`${categoria.cod}: ${categoria.texto}`}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="step-content-container"
              style={{ overflowY: 'auto', paddingRight: '15px' }}
            >
              {categorias.map((c) => (
                <div key={c.id} style={{ display: c.id === categoriaActivaId ? 'block' : 'none' }}>
                  <PreguntasCategoria
                    categoria={c}
                    onRespuesta={manejarCambioRespuestas}
                    onTotalPreguntas={manejarTotalPreguntas}
                  />
                </div>
              ))}
            </div>

          </div>

          <div className="card-footer bg-white border-0 rounded-bottom-3 p-4">
            <div className="d-flex justify-content-between">
              {!isFirstStep && (
                <button onClick={prevStep} className="btn btn-outline-secondary rounded-pill px-4">
                  Anterior
                </button>
              )}
              {isFirstStep && <div />}

              {isLastStep ? (
                <button
                  onClick={enviarEncuesta}
                  className="btn btn-success rounded-pill px-4 shadow-sm"
                  disabled={enviando}
                >
                  {enviando ? 'Enviando...' : 'Enviar Encuesta'}
                </button>
              ) : (
                <button onClick={nextStep} className="btn btn-primary rounded-pill px-4">
                  Siguiente
                </button>
              )}
            </div>

            {mensaje && (
              <div className={`mt-4 alert ${mensaje.includes('éxito') ? 'alert-success' : 'alert-info'}`}>
                {mensaje}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}