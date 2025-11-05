import { useEffect, useState } from "react";
import PreguntasCategoria from "./Categoria";
import MensajeExito from "../../pregunta/preguntaCerrada/MensajeExito";
import { useNavigate, useLocation} from "react-router-dom";
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


export default function CompletarEncuesta() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [respuestasGlobales, setRespuestasGlobales] = useState<Respuesta[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const navigate = useNavigate();
  const [preguntasPorCategoria, setPreguntasPorCategoria] = useState<Record<number, number>>({});
  
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

  const manejarCambioRespuestas = (pregunta_id: number, opcion_id: number | null, texto?: string) => {
    setRespuestasGlobales((prev) => {
      const existentes = prev.filter((r) => r.pregunta_id !== pregunta_id);
      return [...existentes, { pregunta_id, opcion_id, texto_respuesta: texto?? null }];
    });
  };

  const manejarTotalPreguntas = (categoriaId: number, cantidad: number) => {
    setPreguntasPorCategoria((prev) => ({ ...prev, [categoriaId]: cantidad }));
  };

  const totalPreguntas = Object.values(preguntasPorCategoria).reduce((a, b) => a + b, 0);

  const enviarEncuesta = async () => {
    if (respuestasGlobales.length < totalPreguntas) {
      setMensaje("Debes responder todas las preguntas antes de enviar.");
      console.log("Total preguntas:", totalPreguntas);
      console.log("Respuestas dadas:", respuestasGlobales.length);
      return;
    }

    setEnviando(true);
    setMensaje(null);

    const{
      alumnoId,
      encuestaId,
      materiaId
    } = location.state || {};

    if(!alumnoId || !encuestaId || !materiaId){
      console.error("Faltan parámetros:", location.state);
      setMensaje("Error: No se pudieron cargar los datos de la encuesta");
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

      if (!res.ok) throw new Error("Error al enviar encuesta");
      const data = await res.json();

      console.log("Encuesta completada creada:", data);
      setMensaje("Encuesta enviada con éxito.");
      setMensajeExito("¡La encuesta fue completada con éxito!");
      setRespuestasGlobales([]);
    } catch (err) {
      console.error(err);
      setMensaje("Error al enviar la encuesta.");
    } finally {
      setEnviando(false);
    }
  };

  function cerrarPagina(){
    setMensajeExito(null);
    navigate(ROUTES.ENCUESTAS_DISPONIBLES);
  }

  if (mensajeExito) {
    return (
      <MensajeExito
        mensaje={mensajeExito}
        onClose={cerrarPagina}
      />
    );
  }


  return (
    <div className="container py-4">
      <div className="card border-0 shadow-lg">
        <div className="card-header bg-primary text-white">
          <h1 className="h4 mb-0 text-center">Encuesta</h1>
        </div>
        <div className="card-body">
          {categorias.length > 0 ? (
            <div className="accordion accordion-flush" id="accordionEncuesta">
              {categorias.map((categoria) => (
                <div className="accordion-item" key={categoria.id}>
                  <h2 className="accordion-header" id={`heading-${categoria.id}`}>
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
                        onTotalPreguntas={manejarTotalPreguntas}
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
              className="btn btn-primary btn-lg px-4 rounded-pill shadow-sm"
              disabled={enviando}
            >
              {enviando ? "Enviando..." : "Enviar Encuesta"}
            </button>
            {mensaje && <div className="mt-3 alert alert-info">{mensaje}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
