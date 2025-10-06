import { useEffect, useState } from "react";
import PreguntasCategoria from "./CategoriaB"; 

interface Categoria {
  id: number;
  cod: string;
  texto: string;
}

export default function CompletarEncuesta() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    const codigosDeseados = ["A", "B", "C", "D", "E", "F", "G"];
    fetch("http://localhost:8000/encuestas/1/categorias")
      .then((res) => res.json())
      .then((todas: Categoria[]) => {
        const filtradas = todas.filter((c) =>
          codigosDeseados.includes(c.cod)
        );

        const ordenadas = [...filtradas].sort(
          (a, b) =>
            codigosDeseados.indexOf(a.cod) -
            codigosDeseados.indexOf(b.cod)
        );

        setCategorias(ordenadas);
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
          {categorias.length > 0 ? (
            categorias.map((categoria) => (
              <div key={categoria.id} className="mb-4">
                <h2 className="h5 mb-3">
                  {categoria.cod}: {categoria.texto}
                </h2>
                <PreguntasCategoria categoria={categoria} />
              </div>
            ))
          ) : (
            <div className="alert alert-info">
              Cargando categorías...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}