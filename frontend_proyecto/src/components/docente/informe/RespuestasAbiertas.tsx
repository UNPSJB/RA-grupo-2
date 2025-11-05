import { useEffect, useState } from "react";
import { ANIO_ACTUAL, PERIODO_ACTUAL } from "../../../constants";

interface DatosAbiertosPregunta {
  id_pregunta: number;
  enunciado: string;
  respuestas: string[];
}

interface DatosAbiertosCategoria {
  categoria_cod: string;
  categoria_texto: string;
  preguntas: DatosAbiertosPregunta[];
}

interface RelacionDocenteMateria {
  docente_id: number;
  materia_id: number;
  anio: number | null;
  periodo: string | number | null;
}

interface Props {
  docenteMateriaId: number;
}

export default function RespuestasAbiertas({ docenteMateriaId }: Props) {
  const [categorias, setCategorias] = useState<DatosAbiertosCategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDatos = async () => {
      setLoading(true);
      setError(null);
      try {
        const relacionRes = await fetch(
          `http://127.0.0.1:8000/docentes/materia_relacion/${docenteMateriaId}`
        );
        if (!relacionRes.ok) throw new Error("Error al obtener la relación docente-materia");

        const relacion: RelacionDocenteMateria = await relacionRes.json();
        const materiaId = relacion.materia_id;
        const anio = relacion.anio ?? ANIO_ACTUAL;
        const periodo = relacion.periodo ?? PERIODO_ACTUAL;

        const respuestasRes = await fetch(
          `http://127.0.0.1:8000/datos_estadisticos/respuestas_abiertas?id_materia=${materiaId}&anio=${anio}&periodo=${periodo}`
        );
        if (!respuestasRes.ok) throw new Error("Error al obtener respuestas abiertas");

        const data: DatosAbiertosCategoria[] = await respuestasRes.json();
        setCategorias(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
  }, [docenteMateriaId]);

  if (loading)
    return (
      <div className="text-center my-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2">Cargando respuestas abiertas...</p>
      </div>
    );

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!categorias.length)
    return (
      <div className="alert alert-info mt-4">
        No se registran respuestas de retroalimentación.
      </div>
    );

  return (
    <div className="container-lg py-5">
      <div className="card border-0 shadow-lg rounded-4">
        <div className="card-header bg-primary text-white rounded-top-4">
          <h1 className="h4 mb-0 text-center">
            Opiniones de los estudiantes sobre la materia
          </h1>
        </div>

        <div className="card-body bg-light">
          <div className="accordion" id="accordionGeneral">
            <div className="accordion-item border-0 mb-3">
              <h2 className="accordion-header" id="headingGeneral">
                <button
                  className="accordion-button collapsed fw-semibold"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseGeneral"
                  aria-expanded="false"
                  aria-controls="collapseGeneral"
                >
                  Ver opiniones y comentarios sobre la materia
                </button>
              </h2>

              <div
                id="collapseGeneral"
                className="accordion-collapse collapse"
                aria-labelledby="headingGeneral"
                data-bs-parent="#accordionGeneral"
              >
                <div className="accordion-body bg-white rounded-3 shadow-sm">
                  {categorias.map((cat, catIndex) => (
                    <div key={catIndex} className="mb-4">

                      <div className="accordion" id={`accordion-cat-${catIndex}`}>
                        {cat.preguntas.map((pregunta, index) => (
                          <div className="accordion-item mb-2 border rounded-3" key={pregunta.id_pregunta}>
                            <h2 className="accordion-header" id={`heading-${catIndex}-${index}`}>
                              <button
                                className={`accordion-button ${index === 0 ? "" : "collapsed"}`}
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target={`#collapse-${catIndex}-${index}`}
                                aria-expanded={index === 0 ? "true" : "false"}
                                aria-controls={`collapse-${catIndex}-${index}`}
                              >
                                {pregunta.enunciado}
                              </button>
                            </h2>

                            <div
                              id={`collapse-${catIndex}-${index}`}
                              className={`accordion-collapse collapse ${index === 0 ? "show" : ""}`}
                              aria-labelledby={`heading-${catIndex}-${index}`}
                              data-bs-parent={`#accordion-cat-${catIndex}`}
                            >
                              <div className="accordion-body">
                                {pregunta.respuestas.length > 0 ? (
                                  <ul className="list-group list-group-flush">
                                    {pregunta.respuestas.map((texto, i) => (
                                      <li key={i} className="list-group-item">
                                        {texto || "Sin respuesta"}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-muted">Sin respuestas registradas.</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
