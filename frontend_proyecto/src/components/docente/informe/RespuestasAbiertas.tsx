import { useEffect, useState, Fragment } from "react";
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
        if (!relacionRes.ok)
          throw new Error("Error al obtener la relación docente-materia");

        const relacion: RelacionDocenteMateria = await relacionRes.json();
        const materiaId = relacion.materia_id;
        const anio = relacion.anio ?? ANIO_ACTUAL;
        const periodo = relacion.periodo ?? PERIODO_ACTUAL;

        const respuestasRes = await fetch(
          `http://127.0.0.1:8000/datos_estadisticos/respuestas_abiertas?id_materia=${materiaId}&anio=${anio}&periodo=${periodo}`
        );
        if (!respuestasRes.ok)
          throw new Error("Error al obtener respuestas abiertas");

        const data: DatosAbiertosCategoria[] = await respuestasRes.json();
        setCategorias(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Ocurrió un error inesperado"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
  }, [docenteMateriaId]);

  if (loading) return <p>Cargando respuestas abiertas...</p>;

  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  if (
    !categorias.length ||
    categorias.every((cat) => cat.preguntas.length === 0)
  )
    return (
      <p className="text-muted">
        No se registran respuestas de retroalimentación.
      </p>
    );

  return (
    <Fragment>
      <h5 className="text-dark fw-bold mb-3 mt-4">
        Opiniones de los estudiantes sobre la materia
      </h5>
      <hr className="mb-4" />

      <div
        className="accordion accordion-flush"
        id={`accordionRespuestasAbiertas-${docenteMateriaId}`}
      >
        {categorias.map((cat, catIndex) => (
          <Fragment key={cat.categoria_cod}>
            {cat.preguntas.map((pregunta, pregIndex) => (
              <div className="accordion-item" key={pregunta.id_pregunta}>
                <h2
                  className="accordion-header"
                  id={`heading-${catIndex}-${pregIndex}`}
                >
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse-${catIndex}-${pregIndex}`}
                    aria-expanded="false"
                    aria-controls={`collapse-${catIndex}-${pregIndex}`}
                  >
                    {pregunta.enunciado}
                  </button>
                </h2>
                <div
                  id={`collapse-${catIndex}-${pregIndex}`}
                  className="accordion-collapse collapse"
                  aria-labelledby={`heading-${catIndex}-${pregIndex}`}
                  data-bs-parent={`#accordionRespuestasAbiertas-${docenteMateriaId}`}
                >
                  <div className="accordion-body">
                    {pregunta.respuestas.length > 0 ? (
                      <ul className="list-group list-group-flush">
                        {pregunta.respuestas.map((texto, i) => (
                          <li
                            key={i}
                            className="list-group-item py-2 px-0"
                          >
                            {texto || (
                              <span className="text-muted fst-italic">
                                Sin respuesta
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted small fst-italic mb-0">
                        Sin respuestas registradas para esta pregunta.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </Fragment>
  );
}