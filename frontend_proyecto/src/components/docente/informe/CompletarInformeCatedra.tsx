import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ANIO_ACTUAL } from "../../../constants";
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

const normalizarString = (texto: string): string => {
  if (!texto) return "";
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export default function CompletarInformeCatedra() {
  const location = useLocation();
  const navigate = useNavigate();
  const [categoriasConPreguntas, setCategoriasConPreguntas] = useState<
    CategoriaConPreguntas[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [respuestas, setRespuestas] = useState<Record<number, RespuestaValor>>(
    {}
  );
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [datosEstadisticos, setDatosEstadisticos] = useState<
    DatosEstadisticosCategoria[]
  >([]);
  const [cantidad, setCantidad] = useState<number>(0);
  const [cantidadInscriptos, setCantidadInscriptos] = useState<number>(0);
  const [cantidadComisionesTeoricas, setCantidadComisionesTeoricas] =
    useState(1);
  const [cantidadComisionesPracticas, setCantidadComisionesPracticas] =
    useState(1);
  const [JTP, SetJTP] = useState("");
  const [aux1, SetAux1] = useState("");
  const [aux2, SetAux2] = useState("");

  const {
    docenteMateriaId,
    materiaId,
    materiaNombre,
    anio,
    periodo,
    informeBaseId = 3,
  } = location.state || {};

  const [currentStep, setCurrentStep] = useState(1);
  const [maxPasoAlcanzado, setMaxPasoAlcanzado] = useState(1);

  const steps = [
    { id: 1, name: "Datos Generales" },
    { id: 2, name: "Datos Estadísticos" },
    { id: 3, name: "1. Recursos" },
    { id: 4, name: "2. Desarrollo Curricular" },
    { id: 5, name: "3. Actividades del Equipo" },
    { id: 6, name: "4. Valoración" },
  ];
  const totalSteps = steps.length;

  const validarPaso = (paso: number): Pregunta | null => {
    let preguntasDelPasoActual: Pregunta[] = [];
    const categoriasDelPaso: (CategoriaConPreguntas | undefined)[] = [];

    if (paso === 3) {
      categoriasDelPaso.push(
        categoriasConPreguntas.find((cat) => cat.cod === "1")
      );
    } else if (paso === 4) {
      categoriasDelPaso.push(
        categoriasConPreguntas.find((cat) => cat.cod === "2")
      );
      categoriasDelPaso.push(
        categoriasConPreguntas.find((cat) => cat.cod === "2.A")
      );
      categoriasDelPaso.push(
        categoriasConPreguntas.find((cat) => cat.cod === "2.B")
      );
      categoriasDelPaso.push(
        categoriasConPreguntas.find((cat) => cat.cod === "2.C")
      );
    } else if (paso === 5) {
      categoriasDelPaso.push(
        categoriasConPreguntas.find((cat) => cat.cod === "3")
      );
    } else if (paso === 6) {
      categoriasDelPaso.push(
        categoriasConPreguntas.find((cat) => cat.cod === "4")
      );
    }

    categoriasDelPaso.forEach((cat) => {
      if (cat && cat.preguntas) {
        preguntasDelPasoActual.push(...cat.preguntas);
      }
    });

    const preguntasObligatorias = preguntasDelPasoActual.filter((p) => {
      if (!p.obligatoria) return false;

      const pNombre = normalizarString(p.enunciado);

      if (
        (pNombre.includes("jtp") ||
          pNombre.includes("calificacion - jtp") ||
          pNombre.includes("justificacion - jtp")) &&
        !JTP.trim()
      ) {
        return false;
      }

      if (
        (pNombre.includes("auxiliar de primera") ||
          pNombre.includes("calificacion - auxiliar de primera") ||
          pNombre.includes("justificacion - auxiliar de primera")) &&
        !aux1.trim()
      ) {
        return false;
      }

      if (
        (pNombre.includes("auxiliar de segunda") ||
          pNombre.includes("calificacion - auxiliar de segunda") ||
          pNombre.includes("justificacion - auxiliar de segunda")) &&
        !aux2.trim()
      ) {
        return false;
      }

      return true;
    });

    const primeraFaltante = preguntasObligatorias.find((p) => {
      const respuesta = respuestas[p.id];
      if (!respuesta) return true;
      if (
        respuesta.opcion_id === null &&
        (!respuesta.texto_respuesta || respuesta.texto_respuesta.trim() === "")
      ) {
        return true;
      }
      return false;
    });

    return primeraFaltante || null;
  };

  const nextStep = () => {
    setMensaje(null);
    const preguntaFaltante = validarPaso(currentStep);

    if (preguntaFaltante) {
      setMensaje(
        `Debe completar todas las preguntas obligatorias (*) para continuar. Falta: "${preguntaFaltante.enunciado}"`
      );
      return;
    }

    const proximoPaso = Math.min(currentStep + 1, totalSteps);
    setCurrentStep(proximoPaso);
    setMaxPasoAlcanzado((prev) => Math.max(prev, proximoPaso));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const goToStep = (stepId: number) => {
    setMensaje(null);

    if (stepId > maxPasoAlcanzado) {
      for (let i = maxPasoAlcanzado; i < stepId; i++) {
        const preguntaFaltante = validarPaso(i);
        if (preguntaFaltante) {
          setMensaje(
            `Debe completar el paso "${steps[i - 1].name}" antes de avanzar. Falta: "${
              preguntaFaltante.enunciado
            }"`
          );
          return;
        }
      }
    }

    setCurrentStep(stepId);
    setMaxPasoAlcanzado((prev) => Math.max(prev, stepId));
  };

  useEffect(() => {
    if (!informeBaseId) {
      setError("ID de informe base no encontrado.");
      setLoading(false);
      return;
    }
    fetch(
      `http://127.0.0.1:8000/informes_catedra/${informeBaseId}/categorias_con_preguntas`
    )
      .then((res) => {
        if (!res.ok)
          throw new Error("No se pudo cargar la estructura del informe.");
        return res.json();
      })
      .then((data: CategoriaConPreguntas[]) => {
        const dataOrdenada = [...data].sort((a, b) =>
          a.cod.localeCompare(b.cod, "es", { sensitivity: "base" })
        );
        setCategoriasConPreguntas(dataOrdenada);
      })
      .catch((err) => {
        console.error("Error fetching estructura informe:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [informeBaseId]);

  useEffect(() => {
    setDatosEstadisticos([]);
    fetch(
      `http://127.0.0.1:8000/datos_estadisticos/?id_materia=${materiaId}&anio=${anio}&periodo=${periodo}`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener los datos");
        return res.json();
      })
      .then((data) => {
        if (data.length != 0) {
          const dataOrdenada = [...data].sort((a, b) =>
            a.categoria_cod.localeCompare(b.categoria_cod, "es", {
              sensitivity: "base",
            })
          );
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
    fetch(
      `http://127.0.0.1:8000/datos_estadisticos/cantidad_encuestas_completadas?id_materia=${materiaId}&anio=${anio}&periodo=${periodo}`
    )
      .then((res) => {
        if (!res.ok)
          throw new Error("Error al obtener la cantidad de encuestas");
        return res.json();
      })
      .then((data) => {
        setCantidad(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [anio, materiaId, periodo]);

  const manejarCambio = (preguntaId: number, valor: RespuestaValor) => {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: valor }));
    if (mensaje && mensaje.includes("obligatorias")) setMensaje(null);
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

    for (let i = 1; i <= totalSteps; i++) {
      const preguntaFaltante = validarPaso(i);
      if (preguntaFaltante) {
        setMensaje(
          `Debe completar todas las preguntas obligatorias (*). Revise el paso "${
            steps[i - 1].name
          }". Falta: "${preguntaFaltante.enunciado}"`
        );
        setEnviando(false);
        return;
      }
    }

    const respuestasFormateadas = Object.entries(respuestas).map(
      ([preguntaIdStr, respuestaObj]) => ({
        pregunta_id: parseInt(preguntaIdStr, 10),
        opcion_id: respuestaObj.opcion_id,
        texto_respuesta: respuestaObj.texto_respuesta,
      })
    );
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
      const res = await fetch(
        "http://127.0.0.1:8000/informe-catedra-completado/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datosParaBackend),
        }
      );
      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ detail: "Error desconocido al enviar." }));
        throw new Error(errorData.detail || "Error al enviar el informe");
      }
      const data = await res.json();
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/datos_estadisticos/guardar_datos/${data.id}`,
          { method: "POST" }
        );
        if (response.ok) {
          setMensaje("Datos estadísticos generados y guardados correctamente.");
        } else {
          setMensaje("Error al guardar los datos estadísticos.");
        }
      } catch (error) {
        console.error(error);
        setMensaje("Error al guardar datos estadisticos.");
      }
      setMensaje("¡Informe enviado con éxito!");
      setTimeout(() => {
        navigate(ROUTES.INFORMES_CATEDRA_PENDIENTES);
      }, 2000);
    } catch (err: Error | unknown) {
      console.error("Error enviando informe:", err);
      setMensaje(`Error: ${(err as Error).message}`);
    } finally {
      setEnviando(false);
    }
  };

  const allPreguntas = categoriasConPreguntas.flatMap((c) => c.preguntas);
  const totalPreguntas = allPreguntas.length;

  const respuestasValidas = Object.values(respuestas).filter(
    (r) =>
      r.opcion_id !== null ||
      (r.texto_respuesta && r.texto_respuesta.trim() !== "")
  ).length;

  const porcentaje =
    totalPreguntas > 0 ? (respuestasValidas / totalPreguntas) * 100 : 0;

  if (!docenteMateriaId || !materiaNombre) {
    return (
      <div className="alert alert-danger">
        Error: No se encontró la información necesaria.
      </div>
    );
  }
  if (loading) {
    return (
      <div className="d-flex justify-content-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
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
            <ul className="nav nav-pills nav-fill mb-4">
              {steps.map((step) => {
                const isDesbloqueado = step.id <= maxPasoAlcanzado;
                const isActivo = currentStep === step.id;

                return (
                  <li key={step.id} className="nav-item">
                    <a
                      className={`nav-link ${
                        isActivo
                          ? "active"
                          : isDesbloqueado
                          ? "text-muted"
                          : "text-muted disabled"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (step.id <= maxPasoAlcanzado) {
                          goToStep(step.id);
                        } else {
                          goToStep(step.id);
                        }
                      }}
                      href="#"
                      style={{
                        cursor: isDesbloqueado ? "pointer" : "not-allowed",
                        fontWeight: 500,
                        opacity: isDesbloqueado ? 1 : 0.6,
                      }}
                    >
                      {step.name}
                    </a>
                  </li>
                );
              })}
            </ul>

            {totalPreguntas > 0 && (
              <div className="mb-4">
                <h6 className="text-center text-muted small mb-1">
                  Progreso Total: {respuestasValidas} de {totalPreguntas} (
                  {porcentaje.toFixed(0)}%)
                </h6>
                <div
                  className="progress"
                  style={{ height: "10px" }}
                  role="progressbar"
                  aria-valuenow={porcentaje}
                >
                  <div
                    className="progress-bar"
                    style={{ width: `${porcentaje}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div
              className="step-content-container"
              style={{
                height: "500px",
                overflowY: "auto",
                paddingRight: "15px",
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
                className="btn btn-theme-primary rounded-pill px-4"
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