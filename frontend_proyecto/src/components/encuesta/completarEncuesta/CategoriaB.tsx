import { useEffect, useState } from "react";

interface Categoria {
  id: number;
  cod: string;
  texto: string;
}

interface Pregunta {
  id: number;
  enunciado: string;
  categoria_id: number;
  encuesta_id: number;
}

export default function PreguntasCategoriaBPage() {
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [categoria, setCategoria] = useState<Categoria | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/categorias")
      .then((res) => res.json())
      .then((categorias: Categoria[]) => {
        const catB = categorias.find((c) => c.cod === "B");
        if (catB) {
          setCategoria(catB);
          fetch(`http://localhost:8000/categorias/${catB.id}/preguntas`)
            .then((res) => res.json())
            .then((preguntasData: Pregunta[]) => setPreguntas(preguntasData))
            .catch((err) =>
              console.error("Error al obtener preguntas de categoría B:", err)
            );
        }
      })
      .catch((err) => console.error("Error al obtener categorías:", err));
  }, []);

  return (
    <div className="container py-4">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h1 className="h4 mb-0">
            Encuesta:
          </h1>
        </div>
        <div className="card-body">
          <h2 className="h5 mb-3"> {categoria ? `${categoria.cod}: ${categoria.texto}` : ""}</h2>

          {preguntas.length === 0 ? (
            <div className="alert alert-warning">
              No hay preguntas disponibles para esta categoría.
            </div>
          ) : (
            <div className="list-group">
              {preguntas.map((p, i) => (
                <div key={p.id} className="col-12 mb-3">
                  <div className="card">
                    <div
                      className="card-body d-flex justify-content-between align-items-center"
                      style={{ gap: "1rem" }}
                    >
                      <div className="flex-grow-1">
                        <span className="text-muted me-2">{i + 1}.</span>
                        <span>{p.enunciado}</span>
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ whiteSpace: "nowrap" }}
                      >
                        Seleccionar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

