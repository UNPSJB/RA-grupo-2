import { useEffect, useState } from "react";
import OpcionesSelector from "./OpcionesSelector";
import NuevaOpcionForm from "./NuevaOpcionForm";
import MensajeExito from "./MensajeExito";
import CategoriaSelector from "./CategoriaSelector";
import api from "../../../services/api";

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
    api.get("/opciones")
      .then((res) => {
        const data = res.data;
        setOpciones(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Error cargando opciones:", err));
  }, []);

  useEffect(() => {
    api.get("/encuestas/1/categorias")
      .then((res) => {
        const data = res.data;
        setCategorias(Array.isArray(data) ? data : []);
      })
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

    api.post("/preguntas/cerrada", {
      categoria_id: Number(categoriaSeleccionada),
      enunciado,
      opcion_ids: opcionSeleccionadas,
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

        <CategoriaSelector
          categorias={categorias}
          categoriaSeleccionada={categoriaSeleccionada}
          onChange={(id) => setCategoriaSeleccionada(id)}
        />

        <OpcionesSelector
          opciones={opciones}
          opcionSeleccionadas={opcionSeleccionadas}
          toggleOpcion={toggleOpcion}
        />

        <NuevaOpcionForm
          onOpcionCreada={(opcion) => {
            setOpciones([...opciones, opcion]);
            setOpcionSeleccionadas([...opcionSeleccionadas, opcion.id]);
          }}
        />

        <div className="d-flex justify-content-end mt-3">
          <button type="submit" className="btn btn-primary">
            Guardar Pregunta
          </button>
        </div>
      </form>
    </>
  );
}