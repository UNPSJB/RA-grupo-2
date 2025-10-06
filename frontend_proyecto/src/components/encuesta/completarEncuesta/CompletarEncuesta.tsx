import { useEffect, useState } from "react";
import PreguntasCategoria from "./CategoriaB";

interface Categoria {
  id: number;
  cod: string;
  texto: string;
}

export default function CompletarEncuesta() {
  const [categoria, setCategoria] = useState<Categoria | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/categorias")
      .then((res) => res.json())
      .then((categorias: Categoria[]) => {
        const catB = categorias.find((c) => c.cod === "B");
        if (catB) setCategoria(catB);
      })
      .catch((err) => console.error("Error al obtener categorías:", err));
  }, []);

  return (
    <div className="container py-4">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h1 className="h4 mb-0">Encuesta</h1>
        </div>
        <div className="card-body">
          {categoria ? (
            <>
              <h2 className="h5 mb-3">
                {categoria.cod}: {categoria.texto}
              </h2>
              <PreguntasCategoria categoria={categoria} />
            </>
          ) : (
            <div className="alert alert-info">Cargando categoría...</div>
          )}
        </div>
      </div>
    </div>
  );
}
