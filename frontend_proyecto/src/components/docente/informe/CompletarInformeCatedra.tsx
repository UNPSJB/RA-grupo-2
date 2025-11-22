import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// instancia api
import api from "../../../services/api";
import { ANIO_ACTUAL } from "../../../constants";
import ROUTES from "../../../paths";
import ContenidoPasos from "./ContenidoPasos";

interface Pregunta {
  id: number;
  enunciado: string;
  categoria_id: number;
}

interface CategoriaConPreguntas {
  id: number;
  cod: string;
  texto: string;
  preguntas: Pregunta[];
}

interface OpcionPorcentaje {
  opcion_id: string;
  porcentaje: number;
}

interface DatosEstadisticosPregunta {
  id_pregunta: string;
  datos: OpcionPorcentaje[];
}

interface DatosEstadisticosCategoria {
  categoria_cod: string;
  categoria_texto: string;
  promedio_categoria: OpcionPorcentaje[];
  preguntas: DatosEstadisticosPregunta[];
}

type RespuestaValor = {
  opcion_id: number | null;
  texto_respuesta: string | null;
};

export default function CompletarInformeCatedra() {
  const location = useLocation();
  const navigate = useNavigate();
  const [categoriasConPreguntas, setCategoriasConPreguntas] = useState<CategoriaConPreguntas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [respuestas, setRespuestas] = useState<Record<number, RespuestaValor>>({});
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [datosEstadisticos, setDatosEstadisticos] = useState<DatosEstadisticosCategoria[]>([]);
  const [cantidad, setCantidad] = useState<number>(0);
  const [cantidadInscriptos, setCantidadInscriptos] = useState<number>(0);
  const [cantidadComisionesTeoricas, setCantidadComisionesTeoricas] = useState(1);
  const [cantidadComisionesPracticas, setCantidadComisionesPracticas] = useState(1);
  const [JTP, SetJTP] = useState("");
  const [aux1, SetAux1] = useState("");
  const [aux2, SetAux2] = useState("");
  
  
  const { docenteMateriaId, materiaId, materiaNombre, anio, periodo, informeBaseId = 3 } = location.state || {};

  const [currentStep, setCurrentStep] = useState(1);
  
  const steps = [
    { id: 1, name: "Datos Generales" },
    { id: 2, name: "Datos Estadísticos" },
    { id: 3, name: "1. Recursos" },
    { id: 4, name: "2. Desarrollo Curricular" },
    { id: 5, name: "3. Actividades del Equipo" },
    { id: 6, name: "4. Valoración" }
  ];
  const totalSteps = steps.length;

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };
  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };
  const goToStep = (stepId: number) => {
    setCurrentStep(stepId);
  };

  useEffect(() => {
    if (!informeBaseId) {
      setError("ID de informe base no encontrado.");
      setLoading(false);
      return;
    }
    
    api.get(`/informes_catedra/${informeBaseId}/categorias_con_preguntas`)
      .then((res) => {
        const data: CategoriaConPreguntas[] = res.data;
        const dataOrdenada = [...data].sort((a, b) => a.cod.localeCompare(b.cod, "es", { sensitivity: "base" }));
        setCategoriasConPreguntas(dataOrdenada);
      })
      .catch((err) => { 
        console.error("Error fetching estructura informe:", err); 
        setError(err.response?.data?.detail || err.message); 
      })
      .finally(() => setLoading(false));
  }, [informeBaseId]);

  useEffect(() => {
    setDatosEstadisticos([]);
    const params = { id_materia: materiaId, anio, periodo };

    api.get('/datos_estadisticos/', { params })
      .then((res) => {
        const data = res.data;
        if (data.length !== 0) {
          const dataOrdenada = [...data].sort((a: any, b: any) => a.categoria_cod.localeCompare(b.categoria_cod, "es", { sensitivity: "base" }));
          setDatosEstadisticos(dataOrdenada);
        }
      })
      .catch((error) => { 
        console.error(error); 
        setMensaje("Error al obtener los datos estadísticos."); 
      })
      .finally(() => setLoading(false));
  }, [materiaId, anio, periodo]);

  useEffect(() => {
    const params = { id_materia: materiaId, anio, periodo };
    
    api.get('/datos_estadisticos/cantidad_encuestas_completadas', { params })
      .then((res) => { setCantidad(res.data); })
      .catch((error) => { console.error(error); });
  }, [anio, materiaId, periodo]);

  
  const manejarCambio = (preguntaId: number, valor: RespuestaValor) => {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: valor }));
    if (mensaje && mensaje.includes("complete")) setMensaje(null);
  };

  const manejarDatosGenerados = (datos: any) => {
    setCantidadInscriptos(datos.cantidadAlumnos);
    setCantidadComisionesTeoricas(datos.cantidadComisionesTeoricas);
    setCantidadComisionesPracticas(datos.cantidadComisionesPracticas);
    SetJTP(datos.JTP);
    SetAux1(datos.aux1);
    SetAux2(datos.aux2);
  };


  const enviarInforme = async () => {
    setEnviando(true);
    setMensaje(null);
    
    const respuestasFormateadas = Object.entries(respuestas).map(([preguntaIdStr, respuestaObj]) => ({
      pregunta_id: parseInt(preguntaIdStr, 10),
      opcion_id: respuestaObj.opcion_id,
      texto_respuesta: respuestaObj.texto_respuesta,
    }));

    const datosParaBackend = {
      docente_materia_id: docenteMateriaId,
      informe_catedra_base_id: informeBaseId,
      titulo: `Informe ${materiaNombre} ${anio}`,
      contenido: `Informe para ${materiaNombre} (${periodo} ${anio})`,
      cantidadAlumnos: cantidadInscriptos,
      anio: ANIO_ACTUAL,
      periodo: periodo,
      cantidadComisionesTeoricas,
      cantidadComisionesPracticas,
      JTP: JTP.trim()? JTP: null,
      aux_primera: aux1.trim()? aux1 : null,
      aux_segunda: aux2.trim()? aux2 : null,
      respuestas: respuestasFormateadas,
    };

    try {
      const res = await api.post("/informe-catedra-completado/", datosParaBackend);
      const data = res.data;
      try {
        await api.post(`/datos_estadisticos/guardar_datos/${data.id}`);
        setMensaje("Datos estadísticos generados y guardados correctamente.");
      } catch (error) { 
        console.error(error); 
        setMensaje("Informe guardado, pero hubo un error al guardar datos estadisticos."); 
      }

      setMensaje("¡Informe enviado con éxito!");
      setTimeout(() => { navigate(ROUTES.INFORMES_CATEDRA_PENDIENTES); }, 2000);

    } catch (err: any) { 
      console.error("Error enviando informe:", err); 
      const errorMsg = err.response?.data?.detail || err.message || "Error desconocido";
      setMensaje(`Error: ${errorMsg}`);
    } finally { 
      setEnviando(false); 
    }
  };


  if (!docenteMateriaId || !materiaNombre) {
    return <div className="alert alert-danger">Error: No se encontró la información necesaria.</div>;
  }
  if (loading) {
    return <div className="d-flex justify-content-center"><div className="spinner-border text-primary" role="status"></div></div>;
  }
  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

return (
    <div className="bg-light">
      <div className="container-lg py-4">
        <div className="card shadow-sm border-0 rounded-3">
          <div className="card-header bg-unpsjb-header">
            <h1 className="h4 mb-0 text-center">
              Informe de Cátedra – {materiaNombre}
            </h1>
          </div>

          <div className="card-body p-4 p-md-5">
            <style>
              {`
                .nav-pills .nav-link,
                .nav-pills .nav-link:visited,
                .nav-pills .nav-link:focus,
                .nav-pills .nav-link:active,
                .nav-pills .nav-link:hover {
                  color: black !important;
                  background-color: transparent !important;
                  opacity: 1 !important;
                  box-shadow: none !important;
                  outline: none !important;
                }

                .nav-pills .nav-link.active {
                  color: white !important;
                  background-color: var(--color-unpsjb-blue, #005ec2) !important;
                  opacity: 1 !important;
                  font-weight: 400 !important;
                }
              `}
            </style>

            <ul className="nav nav-pills nav-fill mb-4">
              {steps.map(step => (
                <li key={step.id} className="nav-item">
                  <a
                    className={`nav-link ${currentStep === step.id ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); goToStep(step.id); }}
                    href="#"
                    style={{ cursor: 'pointer', fontWeight: 500 }}
                  >
                    {step.name}
                  </a>
                </li>
              ))}
            </ul>

            <div
              className="step-content-container"
              style={{
                height: '500px',
                overflowY: 'auto',
                paddingRight: '15px'
              }}
            >
              <ContenidoPasos
                currentStep={currentStep}
                categoriasConPreguntas={categoriasConPreguntas}
                datosEstadisticos={datosEstadisticos}
                cantidad={cantidad}
                respuestas={respuestas}
                docenteMateriaId={docenteMateriaId}
                manejarCambio={manejarCambio}
                onDatosGenerados={manejarDatosGenerados}
                nombresFuncion={{ JTP, aux1, aux2 }}
                setNombresFuncion={{ SetJTP, SetAux1, SetAux2 }}
              />
            </div>
          </div>


          <div className="card-footer bg-white border-0 rounded-bottom-3 p-4">
            <div className="d-flex justify-content-between">
              <button
                onClick={prevStep}
                className="btn btn-outline-secondary rounded-pill px-4"
                disabled={currentStep === 1}
              >
                Anterior
              </button>
              
              {currentStep < totalSteps && (
                <button
                  onClick={nextStep}
                  className="btn btn-theme-primary rounded-pill px-4"
                >
                  Siguiente
                </button>
              )}

              {currentStep === totalSteps && (
                <button
                  onClick={enviarInforme}
                  className="btn btn-success rounded-pill px-4 shadow-sm"
                  disabled={enviando}
                >
                  {enviando ? "Enviando..." : "Enviar Informe"}
                </button>
              )}
            </div>

            {mensaje && (
              <div
                className={`mt-4 alert ${
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