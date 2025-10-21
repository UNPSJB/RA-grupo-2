import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoriaSelector from "../pregunta/preguntaCerrada/CategoriaSelector";

interface Categoria {
  id: number;
  cod: string;
  texto: string;
}
export default function InformeCatedraBaseForm() {
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState("");
  const [materias, setMaterias] = useState("");
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const agregarCategoria = () => {
    setCategorias([...categorias, { cod: "", texto: "", encuesta_id: "" }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      titulo,
      materias: materias
        .split(",")
        .filter(Boolean)
        .map((id) => ({ id: Number(id.trim()) })),
      categorias: categorias.map((c) => ({
        cod: c.cod,
        texto: c.texto,
        encuesta_id: c.encuesta_id ? Number(c.encuesta_id) : null,
      })),
    };

    await fetch("http://localhost:8000/informes_catedra", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    navigate("/informes-catedra-base");
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Nuevo Informe de Cátedra Base</h1>
      <form onSubmit={handleSubmit}>
        <label>Título:</label>
        <br />
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
        />
        <br />
        <br />

        <label>Materias (IDs separados por coma):</label>
        <br />
        <input
          value={materias}
          onChange={(e) => setMaterias(e.target.value)}
          placeholder="1,2,3"
        />
        <br />
        <br />

        <h3>Categorías</h3>
        {categorias.map((cat, i) => (
          <div
            key={i}
            style={{
              border: "1px solid #ccc",
              padding: "8px",
              marginBottom: "8px",
            }}
          >
            <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                          <label className="form-label fw-bold">Enunciado</label>
                          <input
                            type="text"
                            className="form-control"
                            value={enunciado}
                            onChange={(e) => setEnunciado(e.target.value)}
                            placeholder="Escriba la pregunta abierta..."
                          />
                        </div>
            
                        <CategoriaSelector
                          categorias={categorias}
                          categoriaSeleccionada={categoriaSeleccionada}
                          onChange={(id) => setCategoriaSeleccionada(id)}
                        />
          </div>
        ))}
        <button type="button" onClick={agregarCategoria}>
          + Agregar categoría
        </button>
        <br />
        <br />

        <button type="submit">Guardar informe</button>
      </form>
    </div>
  );
}
