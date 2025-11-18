import { useEffect, useState, useCallback } from "react"; // <--- BIEN (Importa useCallback)
import PreguntasCategoria from "./Categoria";
import MensajeExito from "../../pregunta/preguntaCerrada/MensajeExito";
import { useNavigate, useLocation } from "react-router-dom";
import { ANIO_ACTUAL, PERIODO_ACTUAL } from "../../../constants";
import ROUTES from "../../../paths";

interface Categoria {
  id: number;
  cod: string;
  texto: string;
}

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
  tipo: "cerrada" | "abierta";
  obligatoria: boolean;
}

export default function CompletarEncuesta() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [respuestasGlobales, setRespuestasGlobales] = useState<Respuesta[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const navigate = useNavigate();
  const [allPreguntas, setAllPreguntas] = useState<Pregunta[]>([]);
  const location = useLocation();

  useEffect(() => {
    const { encuestaId = 1 } = location.state || {};
    fetch(`http://localhost:8000/encuestas/${encuestaId}/categorias`)
      .then((res) => res.json())
      .then((todas: Categoria[]) => {
        const dataOrdenada = [...todas].sort((a, b) =>
          a.cod.localeCompare(b.cod, "es", { sensitivity: "base" })
        );
        setCategorias(dataOrdenada);
      })
      .catch((err) => console.error("Error al obtener categorías:", err));
  }, [location.state]);

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
      console.log("Faltante:", primeraFaltante.enunciado);
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
      const res = await fetch(
        "http://localhost:8000/encuesta-completada/con-respuestas",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datos),
        }
      );

      const data = await res.json(); 

      if (!res.ok) { 
        throw new Error(data.detail || "Error desconocido desde el backend");
      }

      console.log("Encuesta completada creada:", data);
      setMensaje("Encuesta enviada con éxito.");
      setMensajeExito("¡La encuesta fue completada con éxito!");
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

  return (
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
                    >
                      {`${categoria.cod}: ${categoria.texto}`}
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
                </div>
              ))}
            </div>
          ) : (
            <div className="alert alert-info">Cargando categorías...</div>
          )}

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
          </div>
        </div>
      </div>
    </div>
  );
}