import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import ROUTES from "../../../paths";
import ContenidoPasos from "../../docente/informe/ContenidoPasos";
import type { Categoria } from "../../../types/types";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import InformeCatedraPDF from "./InformeCatedraPdf";
// instancia de axios 
import api from "../../../services/api";

interface Pregunta {
  id: number;
  enunciado: string;
  tipo: string;
  categoria_id: number;
  categoria: Categoria;
}

export interface Opcion {
  id: number;
  contenido: string;
}

export interface RespuestaConPregunta {
  id: number;
  texto_respuesta: string | null;
  opcion_id: number | null;
  pregunta: Pregunta;
}

export interface InformeCompletadoDetalle {
  id: number;
  titulo: string | null;
  contenido: string | null;
  anio: number | null;
  periodo: string | null;
  respuestas_informe: RespuestaConPregunta[];
  cantidadAlumnos: number;
  cantidadComisionesTeoricas: number;
  cantidadComisionesPracticas: number;
  JTP: string | null;
  aux_primera: string | null;
  aux_segunda: string | null;
  materiaNombre?: string;
  materiaCodigo?: string;
  sede?: string;
  docenteResponsable?: string;
  materiaId: number;
  docente_materia_id: number;
  informe_catedra_base_id: number;
}

export interface CategoriaConPreguntas {
  id: number;
  cod: string;
  texto: string;
  preguntas: Pregunta[];
}

type RespuestaValor = {
  opcion_id: number | null;
  texto_respuesta: string | null;
};

export default function InformeCatedraDetalle() {
  const handlePDF = async () => {
    if (!informe) return;

    const blob = await pdf(
      <InformeCatedraPDF
        informe={informe}
        categorias={gruposBase}
        opciones={opciones}
      />
    ).toBlob();

    saveAs(blob, `InformeCatedra_${informe.materiaCodigo}.pdf`);
  };

  const { id } = useParams<{ id: string }>();
  const [informe, setInforme] = useState<InformeCompletadoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [datosEstadisticos, setDatosEstadisticos] = useState<any[]>([]);
  const [cantidad, setCantidad] = useState<number>(0);
  const [gruposBase, setGruposBase] = useState<CategoriaConPreguntas[]>([]);
  const [opciones, SetOpciones] = useState<Opcion[]>([]);

  const steps = [
    { id: 1, name: "Datos Generales" },
    { id: 2, name: "Datos Estadísticos" },
    { id: 3, name: "1. Recursos" },
    { id: 4, name: "2. Desarrollo Curricular" },
    { id: 5, name: "3. Actividades del Equipo" },
    { id: 6, name: "4. Valoración" },
  ];

  const goToStep = (stepId: number) => {
    setCurrentStep(stepId);
  };

  useEffect(() => {
    if (!id) {
      setError("ID de informe no proporcionado");
      setLoading(false);
      return;
    }

    const fetchInforme = async () => {
      try {
        const res = await api.get(`/informe-catedra-completado/${id}`);
        const dataInforme: InformeCompletadoDetalle = res.data;

        setInforme(dataInforme);

        if (dataInforme.informe_catedra_base_id) {
          const resBase = await api.get(
            `/informes_catedra/${dataInforme.informe_catedra_base_id}/categorias_con_preguntas`
          );
          const dataBase: CategoriaConPreguntas[] = resBase.data;
          const dataOrdenada = [...dataBase].sort((a, b) =>
            a.cod.localeCompare(b.cod, "es", { sensitivity: "base" })
          );

          dataOrdenada.forEach((grupo) => {
            grupo.preguntas.sort((a, b) => a.id - b.id);
          });

          setGruposBase(dataOrdenada);
        }

        const { materiaId, anio, periodo } = dataInforme;

        const paramsEstadistica = {
          id_materia: materiaId,
          anio: anio,
          periodo: periodo
        };
        const resEstadisticas = await api.get('/datos_estadisticos/', { params: paramsEstadistica });
        const dataStats = resEstadisticas.data;

        if (dataStats && dataStats.length > 0) {
           const dataOrdenada = [...dataStats].sort((a: any, b: any) =>
             a.categoria_cod.localeCompare(b.categoria_cod, "es", {
               sensitivity: "base",
             })
           );
           setDatosEstadisticos(dataOrdenada);
        }

        const resCantidad = await api.get('/datos_estadisticos/cantidad_encuestas_completadas', { params: paramsEstadistica });
        setCantidad(resCantidad.data);

      } catch (err: any) {
        console.error("Error cargando detalles:", err);
        const mensaje = err.response?.data?.detail || err.message || "Error desconocido al obtener el informe.";
        setError(mensaje);
      } finally {
        setLoading(false);
      }
    };

    fetchInforme();
  }, [id]);

  const respuestasFormateadas = useMemo((): Record<number, RespuestaValor> => {
    if (!informe) return {};
    const mapaRespuestas: Record<number, RespuestaValor> = {};
    for (const r of informe.respuestas_informe) {
      mapaRespuestas[r.pregunta.id] = {
        opcion_id: r.opcion_id,
        texto_respuesta: r.texto_respuesta,
      };
    }
    return mapaRespuestas;
  }, [informe]);

  const datosGenerales = useMemo(() => {
    if (!informe) return {};
    return {
      cicloLectivo: informe.anio ?? undefined,
      periodo: informe.periodo ?? undefined,
      cantidadAlumnos: informe.cantidadAlumnos,
      cantidadComisionesTeoricas: informe.cantidadComisionesTeoricas,
      cantidadComisionesPracticas: informe.cantidadComisionesPracticas,
      JTP: informe.JTP,
      aux1: informe.aux_primera,
      aux2: informe.aux_segunda,
      actividadCurricular: informe.materiaNombre,
      codigoActividadCurricular: informe.materiaCodigo,
      sede: informe.sede,
      docenteResponsable: informe.docenteResponsable,
    };
  }, [informe]);

  const isLastStep = currentStep === steps.length;
  const isFirstStep = currentStep === 1;

  if (loading) {
    return (
      <div className="container py-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>
          <Link to={ROUTES.INFORMES_CATEDRA} className="btn btn-outline-danger">
            Volver al listado
          </Link>
        </div>
      </div>
    );
  }

  if (!informe) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning" role="alert">
          No se encontró el informe solicitado.
        </div>
        <Link to={ROUTES.INFORMES_CATEDRA} className="btn btn-secondary">
          Volver al listado
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-light">
      <div className="container-lg py-4">
        <div className="text-end mt-0 mb-3 me-4">
          <button onClick={handlePDF} className="btn btn-theme-primary rounded-pill px-4">
            Exportar PDF
          </button>
        </div>
        <div className="card shadow-sm border-0 rounded-3">
          <div className="card-header bg-unpsjb-header">
            <h1 className="h4 mb-0 text-center">{informe.titulo || "Informe de Cátedra"}</h1>
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
              {steps.map((step) => (
                <li key={step.id} className="nav-item">
                  <a
                    className={`nav-link ${currentStep === step.id ? "active" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      goToStep(step.id);
                    }}
                    href="#"
                  >
                    {step.name}
                  </a>
                </li>
              ))}
            </ul>

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
                isReadOnly={true}
                categoriasConPreguntas={gruposBase}
                respuestas={respuestasFormateadas}
                datosEstadisticos={datosEstadisticos}
                cantidad={cantidad}
                docenteMateriaId={informe.docente_materia_id}
                datosIniciales={datosGenerales}
                manejarCambio={() => { }}
                onDatosGenerados={() => { }}
                nombresFuncion={{
                  JTP: informe.JTP,
                  aux1: informe.aux_primera,
                  aux2: informe.aux_segunda,
                }}
              />
            </div>
          </div>

          <div className="card-footer bg-white border-0 rounded-bottom-3 p-4">
            <div className="d-flex justify-content-between">
              {isFirstStep ? (
                <div />
              ) : (
                <button
                  className="btn btn-outline-secondary rounded-pill px-4"
                  onClick={() => goToStep(currentStep - 1)}
                >
                  Anterior
                </button>
              )}
              {isLastStep ? (
                <Link
                  to={ROUTES.INFORMES_CATEDRA}
                  className="btn btn-primary rounded-pill px-4"
                  style={{ backgroundColor: "#005ec2", borderColor: "#005ec2" }}
                >
                  Volver al listado
                </Link>
              ) : (
                <button
                  className="btn btn-primary rounded-pill px-4"
                  onClick={() => goToStep(currentStep + 1)}
                  style={{ backgroundColor: "#005ec2", borderColor: "#005ec2" }}
                >
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
