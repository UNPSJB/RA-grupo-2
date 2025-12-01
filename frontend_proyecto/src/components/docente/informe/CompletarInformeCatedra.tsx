import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// instancia api
import api from "../../../services/api";
import { ANIO_ACTUAL, PERIODO_ACTUAL } from "../../../constants";
import ROUTES from "../../../paths";
import ContenidoPasos from "./ContenidoPasos";

interface Pregunta {
  id: number;
  enunciado: string;
  categoria_id: number;
  obligatoria: boolean;
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

  const [cantidadComisionesTeoricas, setCantidadComisionesTeoricas] = useState(-1);
  const [cantidadComisionesPracticas, setCantidadComisionesPracticas] = useState(-1);

  const [JTP, SetJTP] = useState("");
  const [aux1, SetAux1] = useState("");
  const [aux2, SetAux2] = useState("");

  const { docenteMateriaId, materiaId, materiaNombre, anio, periodo, informeBaseId = 3 } = location.state || {};

  const [currentStep, setCurrentStep] = useState(1);
  const [maxStepReached, setMaxStepReached] = useState(1);

  const steps = [
    { id: 1, name: "Datos Generales" },
    { id: 2, name: "Datos Estadísticos" },
    { id: 3, name: "1. Recursos" },
    { id: 4, name: "2. Desarrollo Curricular" },
    { id: 5, name: "3. Actividades del Equipo" },
    { id: 6, name: "4. Valoración" }
  ];
  const totalSteps = steps.length;

  const porcentajeAvance = totalSteps > 1
    ? Math.round(((currentStep - 1) / (totalSteps - 1)) * 100)
    : 100;

  const handleComisionesChange = (tipo: 'teoricas' | 'practicas', valor: number) => {
    if (tipo === 'teoricas') setCantidadComisionesTeoricas(valor);
    if (tipo === 'practicas') setCantidadComisionesPracticas(valor);
  };

  const validarPasoActual = (): boolean => {
    setMensaje(null);

    if (currentStep === 1) {
      if (cantidadComisionesTeoricas <= 0 || cantidadComisionesPracticas <= 0) {
        setMensaje("La cantidad de comisiones debe ser mayor a 0.");
        return false;
      }
      return true;
    }

    if (currentStep === 2) return true;

    let codigosCategorias: string[] = [];
    if (currentStep === 3) codigosCategorias = ["1"];
    if (currentStep === 4) codigosCategorias = ["2", "2.A", "2.B", "2.C"];
    if (currentStep === 5) codigosCategorias = ["3"];
    if (currentStep === 6) codigosCategorias = ["4"];

    const categoriasDelPaso = categoriasConPreguntas.filter(cat => codigosCategorias.includes(cat.cod));
    const preguntasAValidar = categoriasDelPaso.flatMap(cat => cat.preguntas);

    for (const pregunta of preguntasAValidar) {
      const enunciadoLower = pregunta.enunciado.toLowerCase();

      if (enunciadoLower.includes("jtp") && !JTP.trim()) continue;
      if (enunciadoLower.includes("auxiliar de primera") && !aux1.trim()) continue;
      if (enunciadoLower.includes("auxiliar de segunda") && !aux2.trim()) continue;

      if (pregunta.obligatoria) {
        const respuesta = respuestas[pregunta.id];
        const tieneTexto = respuesta?.texto_respuesta && respuesta.texto_respuesta.trim().length > 0;
        const tieneOpcion = respuesta?.opcion_id !== null && respuesta?.opcion_id !== undefined;

        if (!tieneTexto && !tieneOpcion) {
          setMensaje(`Falta completar el apartado: "${pregunta.enunciado}"`);
          return false;
        }
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validarPasoActual()) {
      const next = Math.min(currentStep + 1, totalSteps);
      setCurrentStep(next);
      if (next > maxStepReached) {
        setMaxStepReached(next);
      }
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setMensaje(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const goToStep = (stepId: number) => {
    if (stepId <= maxStepReached) {
      setMensaje(null);
      setCurrentStep(stepId);
    } else if (stepId === currentStep + 1) {
      nextStep();
    }
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
    if (mensaje && mensaje.includes("Falta completar")) setMensaje(null);
  };

  const manejarDatosGenerados = (datos: any) => {
    setCantidadInscriptos(datos.cantidadAlumnos);

    SetJTP((prev) => (prev && prev.trim() !== "" ? prev : (datos.JTP || "")));
    SetAux1((prev) => (prev && prev.trim() !== "" ? prev : (datos.aux1 || "")));
    SetAux2((prev) => (prev && prev.trim() !== "" ? prev : (datos.aux2 || "")));

    setCantidadComisionesTeoricas((prev) => (prev === -1 ? datos.cantidadComisionesTeoricas : prev));
    setCantidadComisionesPracticas((prev) => (prev === -1 ? datos.cantidadComisionesPracticas : prev));
  };

  const enviarInforme = async () => {
    if (!validarPasoActual()) return;

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
      JTP: JTP.trim() ? JTP : null,
      aux_primera: aux1.trim() ? aux1 : null,
      aux_segunda: aux2.trim() ? aux2 : null,
      respuestas: respuestasFormateadas,
    };
    try {
      await api.post("/informe-catedra-completado/", datosParaBackend);
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


  if (!docenteMateriaId || !materiaNombre) return <div className="alert alert-danger">Error: Faltan datos.</div>;
  if (loading) return <div className="d-flex justify-content-center"><div className="spinner-border text-primary"></div></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="bg-light">
      <div className="container-lg py-4">
        <div className="card shadow-sm border-0 rounded-3">
          <div className="card-header bg-unpsjb-header">
            <h1 className="h4 mb-0 text-center">Informe de Cátedra – {materiaNombre}</h1>
          </div>

          <div className="card-body p-4 p-md-5">
            <style>
              {`
                .nav-pills .nav-link { color: #495057; transition: all 0.3s; }
                .nav-pills .nav-link.active { background-color: var(--color-unpsjb-blue, #005ec2) !important; color: white !important; font-weight: 500; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .nav-pills .nav-link.disabled { opacity: 0.6; cursor: not-allowed; }
                .progress-bar { transition: width 0.6s ease; }
              `}
            </style>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="badge bg-primary rounded-pill">{porcentajeAvance}% Completado</span>
              </div>
              <div className="progress" style={{ height: "8px", backgroundColor: "#e9ecef" }}>
                <div className="progress-bar bg-success" role="progressbar" style={{ width: `${porcentajeAvance}%` }} aria-valuenow={porcentajeAvance} aria-valuemin={0} aria-valuemax={100}></div>
              </div>
            </div>

            <ul className="nav nav-pills nav-fill mb-4 border-bottom pb-3">
              {steps.map(step => {
                const isAccessible = step.id <= maxStepReached || step.id === currentStep + 1;
                return (
                  <li key={step.id} className="nav-item">
                    <button
                      className={`nav-link ${currentStep === step.id ? 'active' : ''} ${!isAccessible ? 'disabled' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (isAccessible) goToStep(step.id);
                      }}
                      style={{ cursor: isAccessible ? 'pointer' : 'not-allowed', fontWeight: 500 }}
                    >
                      {step.name}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="step-content-container" style={{ minHeight: '400px', maxHeight: '600px', overflowY: 'auto', paddingRight: '10px' }}>
              <ContenidoPasos
                datosIniciales={{ materiaId, anio, periodo }}
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
                cantidadesComisiones={{ teoricas: cantidadComisionesTeoricas, practicas: cantidadComisionesPracticas }}
                setCantidadesComisiones={handleComisionesChange}
                anio_informe={ANIO_ACTUAL}
                periodo_informe={periodo}
              />
            </div>
          </div>

          <div className="card-footer bg-white border-0 rounded-bottom-3 p-4">
            <div className="d-flex justify-content-between align-items-center">
              <button onClick={prevStep} className="btn btn-outline-secondary rounded-pill px-4" disabled={currentStep === 1}>
                <i className="bi bi-arrow-left me-2"></i>Anterior
              </button>

              {currentStep < totalSteps && (
                <button onClick={nextStep} className="btn btn-theme-primary rounded-pill px-4">
                  Siguiente<i className="bi bi-arrow-right ms-2"></i>
                </button>
              )}

              {currentStep === totalSteps && (
                <button onClick={enviarInforme} className="btn btn-success rounded-pill px-4 shadow-sm" disabled={enviando}>
                  {enviando ? <><span className="spinner-border spinner-border-sm me-2"></span>Enviando...</> : "Enviar Informe"}
                </button>
              )}
            </div>

            {mensaje && (
              <div className={`mt-4 alert ${mensaje.includes("éxito") ? "alert-success" : "alert-danger"} d-flex align-items-center shadow-sm`} role="alert">
                <i className={`bi ${mensaje.includes("éxito") ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"} me-2 fs-5`}></i>
                <div>{mensaje}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}