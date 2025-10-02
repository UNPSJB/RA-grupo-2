import { useState } from "react";

interface Opcion {
  id: number;
  contenido: string;
}

interface Props {
  onOpcionCreada: (opcion: Opcion) => void;
}

export default function NuevaOpcionForm({ onOpcionCreada }: Props) {
  const [nuevaOpcion, setNuevaOpcion] = useState("");

  const handleAgregarOpcion = () => {
    if (!nuevaOpcion.trim()) return;

    fetch("http://127.0.0.1:8000/opciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contenido: nuevaOpcion }),
    })
      .then((res) => res.json())
      .then((data: Opcion) => {
        onOpcionCreada(data);
        setNuevaOpcion("");
      })
      .catch((err) => console.error("Error creando opción:", err));
  };

  return (
    <div className="mb-3 d-flex">
      <input
        type="text"
        className="form-control me-2"
        value={nuevaOpcion}
        onChange={(e) => setNuevaOpcion(e.target.value)}
        placeholder="Nueva opción..."
      />
      <button type="button" className="btn btn-outline-success" onClick={handleAgregarOpcion}>
        Agregar
      </button>
    </div>
  );
}
