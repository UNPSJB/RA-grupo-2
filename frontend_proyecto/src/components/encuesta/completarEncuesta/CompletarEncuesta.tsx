<<<<<<< .mine
import { useEffect, useState, useCallback } from "react"; // <--- BIEN (Importa useCallback)
=======
import { useEffect, useState, useRef, useMemo } from "react";
>>>>>>> .theirs
import PreguntasCategoria from "./Categoria";
import MensajeExito from "../../pregunta/preguntaCerrada/MensajeExito";
import { useNavigate, useLocation } from "react-router-dom";
import { ANIO_ACTUAL, PERIODO_ACTUAL } from "../../../constants";
import ROUTES from "../../../paths";
<<<<<<< .mine

interface Categoria {
  id: number;
  cod: string;
  texto: string;
}

=======
import type { Categoria } from "../../../types/types";
import type {Materia} from "../../../types/types.ts";





>>>>>>> .theirs
interface Respuesta {
  pregunta_id: number;
  opcion_id: number | null;
  texto_respuesta?: string | null;
}

<<<<<<< .mine
interface Pregunta {
  id: number;
  enunciado: string;
  categoria_id: number;
  encuesta_id: number;
  tipo: "cerrada" | "abierta";
  obligatoria: boolean;
}
=======
export default function CompletarEncuesta() {
  const location = useLocation();
  const navigate = useNavigate();





>>>>>>> .theirs

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [respuestasGlobales, setRespuestasGlobales] = useState<Respuesta[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [materia, setMateria] = useState<Materia>();

<<<<<<< .mine
  const [allPreguntas, setAllPreguntas] = useState<Pregunta[]>([]);
  const location = useLocation();
=======
  const [preguntasPorCategoria, setPreguntasPorCategoria] = useState<Record<number, number>>({});

>>>>>>> .theirs

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
    const {materiaId} = location.state
    fetch(`http://127.0.0.1:8000/materias/${materiaId}`)
    .then(res=>{
      if (!res.ok) throw new Error("Error al obtener la materia");
        return res.json();
    })
    .then(setMateria)
    .catch(console.error);
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

<<<<<<< .mine
  // --- BIEN (Usa useCallback para estabilizar la función) ---
  const manejarCambioRespuestas = useCallback(
    (pregunta_id: number, opcion_id: number | null, texto?: string) => {
      setRespuestasGlobales((prev) => {
        const existentes = prev.filter((r) => r.pregunta_id !== pregunta_id);
        return [
          ...existentes,
          { pregunta_id, opcion_id, texto_respuesta: texto ?? null },
        ];
      });
    },
    [] 
  );

  // --- BIEN (Usa useCallback para estabilizar la función) ---
  const handlePreguntasCargadas = useCallback((nuevasPreguntas: Pregunta[]) => {
    setAllPreguntas((prev) => {
      const preguntasMap = new Map(prev.map((p) => [p.id, p]));
      nuevasPreguntas.forEach((p) => preguntasMap.set(p.id, p));
      return Array.from(preguntasMap.values());
=======
  const manejarCambioRespuestas = (pregunta_id: number, opcion_id: number | null, texto?: string) => {
    setRespuestasGlobales((prev) => {
      const existentes = prev.filter((r) => r.pregunta_id !== pregunta_id);
      return [...existentes, { pregunta_id, opcion_id, texto_respuesta: texto ?? null }];
















>>>>>>> .theirs
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

<<<<<<< .mine
    if (primeraFaltante) {
      setMensaje(
        `Debes responder todas las preguntas obligatorias. Falta: "${primeraFaltante.enunciado}"`
      );
      console.log("Faltante:", primeraFaltante.enunciado);
=======
  const enviarEncuesta = async () => {
    if (respuestasGlobales.length < totalPreguntas) {
      setMensaje('Debes responder todas las preguntas antes de enviar.');


>>>>>>> .theirs
      return;
    }

    setEnviando(true);
    setMensaje(null);

    const { alumnoId, encuestaId, materiaId } = location.state || {};

<<<<<<< .mine
    if (!alumnoId || !encuestaId || !materiaId) {
      console.error("Faltan parámetros:", location.state);
      setMensaje("Error: No se pudieron cargar los datos de la encuesta");

=======
    if (!alumnoId || !encuestaId || !materiaId) {
      console.error('Faltan parámetros:', location.state);
      setMensaje('Error: No se pudieron cargar los datos de la encuesta');
      setEnviando(false);
>>>>>>> .theirs
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

<<<<<<< .mine
      const data = await res.json(); 



=======
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: 'Error desconocido' }));
        throw new Error(errData.detail || 'Error al enviar encuesta');
      }
>>>>>>> .theirs

<<<<<<< .mine
      if (!res.ok) { 
        throw new Error(data.detail || "Error desconocido desde el backend");
      }

      console.log("Encuesta completada creada:", data);
      setMensaje("Encuesta enviada con éxito.");
      setMensajeExito("¡La encuesta fue completada con éxito!");
=======
      setMensaje('Encuesta enviada con éxito.');
      setMensajeExito('¡La encuesta fue completada con éxito!');





>>>>>>> .theirs
      setRespuestasGlobales([]);
    } catch (err) {
      console.error(err);
<<<<<<< .mine
      setMensaje(err instanceof Error ? err.message : "Error al enviar la encuesta.");
=======
      setMensaje('Error al enviar la encuesta.');
>>>>>>> .theirs
    } finally {
      setEnviando(false);
    }
  };

  function cerrarPagina() {
    setMensajeExito(null);
    navigate(ROUTES.ENCUESTAS_DISPONIBLES);
  }

<<<<<<< .mine
  const respuestasValidas = respuestasGlobales.filter(
    (r) =>
      r.opcion_id !== null ||
      (r.texto_respuesta && r.texto_respuesta.trim() !== "")
  ).length;

  const totalPreguntas = allPreguntas.length;

  const porcentaje =
    totalPreguntas > 0 ? (respuestasValidas / totalPreguntas) * 100 : 0;

  if (mensajeExito) {
=======
  if (loading) {











>>>>>>> .theirs
<<<<<<< .mine
    return <MensajeExito mensaje={mensajeExito} onClose={cerrarPagina} />;




=======
    return (
      <div className="d-flex justify-content-center py-4">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
>>>>>>> .theirs
  }

<<<<<<< .mine




=======
  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

>>>>>>> .theirs
  if (mensajeExito) {
    return <MensajeExito mensaje={mensajeExito} onClose={cerrarPagina} />;
  }

  const categoriaActiva = categorias.find((c) => c.id === categoriaActivaId) || categorias[currentStep];

  return (
<<<<<<< .mine
    <div className="container py-4">
      <div className="card border-0 shadow-lg">
        <div className="card-header bg-unpsjb-header">
          <h1 className="h4 mb-0 text-center">Encuesta</h1>
        </div>

        {totalPreguntas > 0 && (
          <div className="sticky-top bg-light border-bottom p-2">
            <h6 className="text-center text-muted small mb-1">
              Progreso: {respuestasValidas} de {totalPreguntas} (
              {porcentaje.toFixed(0)}%)
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
          {categorias.length > 0 ? (
            <div className="accordion accordion-flush" id="accordionEncuesta">
              {categorias.map((categoria) => (
                <div className="accordion-item" key={categoria.id}>
                  <h2
                    className="accordion-header"
                    id={`heading-${categoria.id}`}
                  >
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={`#collapse-${categoria.id}`}





















=======
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
>>>>>>> .theirs
                    >
                      {`${categoria.cod}: ${categoria.texto}`}
<<<<<<< .mine
                    </button>
                  </h2>
                  <div
                    id={`collapse-${categoria.id}`}
                    className="accordion-collapse collapse"
                    data-bs-parent="#accordionEncuesta"
                  >
                    <div className="accordion-body">
                      <PreguntasCategoria
                        categoria={categoria}
                        onRespuesta={manejarCambioRespuestas}
                        onPreguntasCargadas={handlePreguntasCargadas}
                      />
                    </div>
                  </div>


=======
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
>>>>>>> .theirs
                </div>
              ))}
            </div>

<<<<<<< .mine
          <hr />
          <div className="text-center mt-4">
            <button
              onClick={enviarEncuesta}
              className="btn btn-theme-primary rounded-pill px-4"
              disabled={enviando}
            >
              {enviando ? "Enviando..." : "Enviar Encuesta"}
            </button>
            {mensaje && (
              <div
                className={`mt-3 alert ${
                  mensaje.includes("éxito") ? "alert-success" : "alert-danger"
                }`}
              >
                {mensaje}
              </div>
            )}
=======


















>>>>>>> .theirs
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