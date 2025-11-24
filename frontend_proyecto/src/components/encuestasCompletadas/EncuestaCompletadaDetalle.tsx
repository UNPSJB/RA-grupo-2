import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import ROUTES from "../../paths";
import { MostrarPeriodo } from "../../constants";

export interface Categoria {
  id: number;
  texto: string;
  cod: string;
}

interface Opcion {
  id: number;
  contenido: string;
}

interface Pregunta {
  id: number;
  enunciado: string;
  categoria_id: number;
  encuesta_id: number;
  tipo: "cerrada" | "abierta";
}

interface Respuesta {
  id: number;
  pregunta_id: number;
  opcion_id: number[] | number | null;
  texto_respuesta: string;
  encuesta_completada_id: number;
}

interface EncuestaCompletada {
  id: number;
  alumno_id: number;
  encuesta_id: number;
  materia_id: number;
  anio: number;
  periodo: string;
  respuestas: Respuesta[];
}

interface Materia {
  id: number;
  nombre: string;
  matricula: string;
}

export default function EncuestaCompletadaDetalle() {
  const { id } = useParams();
  const [encuesta, setEncuesta] = useState<EncuestaCompletada | null>(null);
  const [materia, setMateria] = useState<Materia | null>(null);
  const [preguntas, setPreguntas] = useState<Record<number, Pregunta>>({});
  const [opciones, setOpciones] = useState<Record<number, Opcion[]>>({});
  const [categoriasInfo, setCategoriasInfo] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentTab, setCurrentTab] = useState(0);

  // Scroll estilo informe
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

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
    if (!id) return;

    fetch(`http://127.0.0.1:8000/encuesta-completada/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener la encuesta completada");
        return res.json();
      })
      .then(async (data: EncuestaCompletada) => {
        setEncuesta(data);

        // Fetch materia
        fetch(`http://127.0.0.1:8000/materias/${data.materia_id}`)
          .then((res) => res.json())
          .then((m: Materia) => setMateria(m))
          .catch(() => setMateria(null));

        // Fetch categorías
        fetch("http://127.0.0.1:8000/categorias/")
          .then((res) => res.json())
          .then((cats: Categoria[]) => setCategoriasInfo(cats))
          .catch(() => setCategoriasInfo([]));

        // Preguntas + opciones
        const preguntasTemp: Record<number, Pregunta> = {};
        const opcionesTemp: Record<number, Opcion[]> = {};

        await Promise.all(
          data.respuestas.map(async (r) => {
            const pRes = await fetch(
              `http://127.0.0.1:8000/preguntas/${r.pregunta_id}`
            );
            if (pRes.ok) {
              const pregunta: Pregunta = await pRes.json();
              preguntasTemp[r.pregunta_id] = pregunta;

              if (pregunta.tipo === "cerrada") {
                const oRes = await fetch(
                  `http://127.0.0.1:8000/preguntas/${pregunta.id}/opciones`
                );
                if (oRes.ok) {
                  const ops: Opcion[] = await oRes.json();
                  opcionesTemp[pregunta.id] = ops;
                }
              }
            }
          })
        );

        setPreguntas(preguntasTemp);
        setOpciones(opcionesTemp);
      })
      .catch(() => setError("No se pudo cargar la encuesta completada"))
      .finally(() => setLoading(false));
  }, [id]);

  const categorias = Object.values(preguntas).reduce((acc, p) => {
    if (!acc[p.categoria_id]) acc[p.categoria_id] = [];
    acc[p.categoria_id].push(p);
    return acc;
  }, {} as Record<number, Pregunta[]>);

  const categoriasOrdenadas = Object.keys(categorias)
    .map((id) => Number(id))
    .sort((a, b) => {
      const catA = categoriasInfo.find(c => c.id === a);
      const catB = categoriasInfo.find(c => c.id === b);
      if (!catA || !catB) return a - b;
      return catA.cod.localeCompare(catB.cod, "es", { numeric: true });
    });


  // Mostrar cod + texto
  const mostrarCategoria = (id: number) => {
    const cat = categoriasInfo.find((c) => c.id === id);
    if (!cat) return `Categoría ${id}`;
    return `${cat.cod} - ${cat.texto}`;
  };

  useEffect(() => {
    if (scrollRef.current) {
      const activeElement = scrollRef.current.querySelector(".nav-link.active");
      if (activeElement instanceof HTMLElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [currentTab, categoriasOrdenadas]);

  if (loading)
    return <div className="text-center mt-4">Cargando encuesta...</div>;

  if (error)
    return <div className="alert alert-danger text-center mt-4">{error}</div>;

  if (!encuesta)
    return (
      <div className="alert alert-warning text-center mt-4">
        No se encontró la encuesta completada
      </div>
    );


  return (
    <div className="bg-light">
      <div className="container-lg py-4">

        <div className="card shadow-sm border-0 rounded-3">
          <div className="card-header bg-unpsjb-header text-white text-center">
            <h1 className="h4 mb-0">
              {materia ? materia.nombre : "Desconocida"} {encuesta.anio}{" "}
              {MostrarPeriodo(encuesta.periodo)}
            </h1>
          </div>

          <div className="card-body p-4 p-md-5">

            {/* === ESTILOS IDENTICOS AL INFORME === */}
            <style>
              {`
              .horizontal-scroll-hidden::-webkit-scrollbar { display: none; }
              .horizontal-scroll-hidden { -ms-overflow-style: none; scrollbar-width: none; }
              .is-dragging { cursor: grabbing !important; }
              .nav-pills .nav-item { flex-shrink: 0; }

              .nav-pills .nav-item .nav-link { 
                background-color: transparent !important; 
                color: #212529 !important; 
                font-weight: 500;
                border: none;
                padding: 0.5rem 2rem; 
                margin-right: 0px; 
                opacity: 1 !important; 
                white-space: nowrap; 
                border-radius: 0; 
              }

              .nav-pills .nav-item .nav-link.active {
                background-color: var(--color-unpsjb-blue, #005ec2) !important; 
                color: white !important; 
                border-radius: 5px !important; 
              }

              .nav-pills-scrollable { 
                display: flex; 
                flex-wrap: nowrap; 
                width: fit-content; 
              }
              `}
            </style>

            {/* === TABS === */}
            <div
              ref={scrollRef}
              className={`horizontal-scroll-hidden mb-4 ${isDragging ? "is-dragging" : ""
                }`}
              style={{ overflowX: "auto" }}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
            >
              <ul className="nav nav-pills mb-0 nav-pills-scrollable" role="tablist">
                {categoriasOrdenadas.map((catId, index) => (
                  <li key={catId} className="nav-item">
                    <a
                      className={`nav-link ${currentTab === index ? "active" : "text-dark"
                        }`}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentTab(index);
                      }}
                    >
                      {mostrarCategoria(catId)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* === CONTENIDO === */}
            <div className="mt-4" style={{ minHeight: "40vh" }}>
              {categoriasOrdenadas.map((catId, index) => {
                if (index !== currentTab) return null;

                return (
                  <div key={catId}>
                    {categorias[catId].map((preg) => {
                      const resp = encuesta.respuestas.find(
                        (r) => r.pregunta_id === preg.id
                      );

                      let respuestaTexto = "—";

                      if (resp) {
                        if (preg.tipo === "abierta") {
                          respuestaTexto = resp.texto_respuesta || "—";
                        } else {
                          const ops = opciones[preg.id] || [];

                          const opcionIds = Array.isArray(resp.opcion_id)
                            ? resp.opcion_id
                            : resp.opcion_id != null
                              ? [resp.opcion_id]
                              : [];

                          const seleccionadas = ops.filter((o) =>
                            opcionIds.includes(o.id)
                          );

                          respuestaTexto =
                            seleccionadas.length > 0
                              ? seleccionadas.map((o) => o.contenido).join(", ")
                              : "—";
                        }
                      }

                      return (
                        <div key={preg.id} className="mb-3 p-3 border rounded">
                          <strong>{preg.enunciado}</strong>
                          <div className="mt-1 text-muted">
                            Respuesta: {respuestaTexto}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* === FOOTER CON NAVEGACIÓN IGUAL AL INFORME === */}
            <div className="card-footer bg-white border-0 rounded-bottom-3 p-4">
              <div className="d-flex justify-content-between">

                {/* ANTERIOR */}
                {!(currentTab === 0) ? (
                  <button
                    onClick={() => setCurrentTab(currentTab - 1)}
                    className="btn btn-outline-secondary rounded-pill px-4"
                  >
                    Anterior
                  </button>
                ) : (
                  <div></div>  // para mantener alineación
                )}

                {/* SIGUIENTE o VOLVER */}
                {(currentTab === categoriasOrdenadas.length - 1) ? (
                  <Link
                    to={ROUTES.ENCUESTAS_COMPLETADAS}
                    className="btn btn-theme-primary rounded-pill px-4"
                  >
                    Volver al listado
                  </Link>
                ) : (
                  <button
                    onClick={() => setCurrentTab(currentTab + 1)}
                    className="btn btn-theme-primary rounded-pill px-4"
                    disabled={categoriasOrdenadas.length === 0}
                  >
                    Siguiente
                  </button>
                )}

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
