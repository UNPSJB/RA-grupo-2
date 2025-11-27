import { useState } from "react";
import api from "../../../services/api";

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

    api.post("/opciones", { contenido: nuevaOpcion })
      .then((res) => {
        const data: Opcion = res.data;
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