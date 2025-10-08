import { useState, useEffect } from "react";
import MensajeExito from "../preguntaCerrada/MensajeExito";
import CategoriaSelector from "../preguntaCerrada/CategoriaSelector";

interface Categoria {
  id: number;
  cod: string;
  texto: string;
}

export default function CrearPreguntaAbierta() {
  const [enunciado, setEnunciado] = useState("");
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>("");
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/encuestas/1/categorias") //hardcodeado encuesta 1
      .then((res) => res.json())
      .then((data) => setCategorias(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error cargando categorias:", err));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!enunciado.trim() || !categoriaSeleccionada) {
      alert("Debe ingresar un enunciado y seleccionar una categoría.");
      return;
    }

    fetch("http://127.0.0.1:8000/preguntas/abierta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoria_id: Number(categoriaSeleccionada),
        enunciado,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al crear la pregunta abierta");
        return res.json();
      })
      .then(() => {
        setMensajeExito("¡La pregunta abierta fue creada con éxito!");
        setEnunciado("");
        setCategoriaSeleccionada("");
      })
      .catch((err) => console.error("Error:", err));
  };
  return (
    <div className = "container py-4">
      <div className ="card shadow">
        <div className="card-header bg-primary text-white">
            <h1 className="h4 mb-0">Crear Pregunta Abierta</h1>
        </div>
        <div className="card-body">
          {mensajeExito && (
            <MensajeExito
              mensaje={mensajeExito}
              onClose={() => setMensajeExito(null)}
            />
          )}

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

            <div className="d-flex justify-content-end mt-3">
              <button type="submit" className="btn btn-primary">
                Guardar Pregunta
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}