import { useEffect, useState } from "react";
import OpcionesSelector from "./OpcionesSelector";
import NuevaOpcionForm from "./NuevaOpcionForm";
import MensajeExito from "./MensajeExito";
import CategoriaSelector from "./CategoriaSelector";

interface Opcion {
  id: number;
  contenido: string;
}

interface Categoria {
  id: number;
  cod: string;
  texto: string;
}

export default function PreguntaForm() {
  const [enunciado, setEnunciado] = useState("");
  const [opciones, setOpciones] = useState<Opcion[]>([]);
  const [opcionSeleccionadas, setOpcionSeleccionadas] = useState<number[]>([]);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>("");


  useEffect(() => {
    fetch("http://127.0.0.1:8000/opciones")
      .then((res) => res.json())
      .then((data) => setOpciones(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error cargando opciones:", err));
  }, []);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/encuestas/1/categorias") //hardcodeado encuesta 1
      .then((res) => res.json())
      .then((data) => setCategorias(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error cargando categorias:", err));
  }, []);

  const toggleOpcion = (id: number) => {
    if (opcionSeleccionadas.includes(id)) {
      setOpcionSeleccionadas(opcionSeleccionadas.filter((oid) => oid !== id));
    } else {
      setOpcionSeleccionadas([...opcionSeleccionadas, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !enunciado.trim() ||
      opcionSeleccionadas.length === 0 ||
      !categoriaSeleccionada
    ) {
      alert(
        "Debe ingresar un enunciado y seleccionar al menos una categoría y una opción."
      );
      return;
    }

    fetch("http://127.0.0.1:8000/preguntas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoria_id: Number(categoriaSeleccionada),
        enunciado,
        opcion_ids: opcionSeleccionadas,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error creando pregunta");
        return res.json();
      })
      .then(() => {
        setMensajeExito("¡La pregunta fue creada con éxito!");
        setEnunciado("");
        setOpcionSeleccionadas([]);
        setCategoriaSeleccionada("");
      })
      .catch((err) => console.error("Error:", err));
  };

  return (
    <>
      {mensajeExito && (
        <MensajeExito
          mensaje={mensajeExito}
          onClose={() => setMensajeExito(null)}
        />
      )}

      <form onSubmit={handleSubmit}>
        {/* Enunciado */}
        <div className="mb-3">
          <label className="form-label fw-bold">Enunciado</label>
          <input
            type="text"
            className="form-control"
            value={enunciado}
            onChange={(e) => setEnunciado(e.target.value)}
            placeholder="Escriba la pregunta..."
          />
        </div>

        {/* Selector de categoría */}
        <CategoriaSelector
          categorias={categorias}
          categoriaSeleccionada={categoriaSeleccionada}
          onChange={(id) => setCategoriaSeleccionada(id)}
        />

        {/* Selector de opciones */}
        <OpcionesSelector
          opciones={opciones}
          opcionSeleccionadas={opcionSeleccionadas}
          toggleOpcion={toggleOpcion}
        />

        {/* Form para crear nueva opción */}
        <NuevaOpcionForm
          onOpcionCreada={(opcion) => {
            setOpciones([...opciones, opcion]);
            setOpcionSeleccionadas([...opcionSeleccionadas, opcion.id]);
          }}
        />

        {/* Botón guardar */}
        <div className="d-flex justify-content-end mt-3">
          <button type="submit" className="btn btn-primary">
            Guardar Pregunta
          </button>
        </div>
      </form>
    </>
  );
}
