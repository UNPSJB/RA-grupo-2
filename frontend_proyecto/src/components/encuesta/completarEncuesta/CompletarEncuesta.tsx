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
  const [currentStep, setCurrentStep] = useState(0); 
  
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
        setCurrentStep(0);
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

  const categoriaActiva = categorias[currentStep];

  return (
    <div className="container py-4">
      <div className="card border-0 shadow-lg">
        
        <style>
          {`
            .nav-pills .nav-item .nav-link { 
              border-radius: 0;
              background-color: transparent !important; 
              color: #6c757d; 
              font-weight: 500;
              transition: none; /
            }
            .nav-pills .nav-item .nav-link.active {
              color: #007bff !important; 
              border: 1px solid #dee2e6;
              border-bottom: 2px solid #005ec2;; 
              background-color: white !important;
            }
            .nav-pills .nav-item .nav-link:not(.active):hover {
                background-color: #f8f9fa; 
                color: #5a6268;
            }
          `}
        </style>
        
        <div className="card-header bg-unpsjb-header">
          <h1 className="h4 mb-0 text-center">Encuesta</h1>
        </div>
        
        <div className="card-body p-0">
          
          {categorias.length > 0 ? (
            <>
              <div className="bg-white border-bottom shadow-sm overflow-x-auto" style={{ whiteSpace: 'nowrap' }}>
                <ul className="nav nav-pills d-inline-flex mb-0" id="pills-tab" role="tablist">
                  {categorias.map((categoria, index) => (
                    <li className="nav-item" role="presentation" key={categoria.id}>
                      <a
                        className={`nav-link rounded-0 ${currentStep === index ? 'active' : 'text-muted'}`}
                        onClick={() => setCurrentStep(index)}
                        style={{ 
                            cursor: 'pointer',
                            borderTop: '1px solid transparent', 
                            borderLeft: '1px solid transparent',
                            borderRight: '1px solid transparent',
                        }}
                        role="tab"
                      >
                        {`${categoria.cod}: ${categoria.texto}`} 
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="tab-content p-4" id="pills-tabContent">
                <div 
                  className="tab-pane fade show active" 
                  role="tabpanel" 
                  aria-labelledby={`pills-${categoriaActiva?.cod}-tab`}
                >
                  {categoriaActiva && (
                    <PreguntasCategoria
                      categoria={categoriaActiva}
                      onRespuesta={manejarCambioRespuestas}
                      onTotalPreguntas={manejarTotalPreguntas}
                    />
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="alert alert-info m-4">Cargando categorías...</div>
          )}

          <hr className="m-0" />
          <div className="text-center mt-4 p-4">
            <button
              onClick={enviarEncuesta}
              className="btn btn-theme-primary rounded-pill px-4"
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