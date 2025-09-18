import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DetalleDocente from "./docentes";
import type { Docente } from "../../types/types";

export default function DocentePage() {
  const { id } = useParams<{ id: string }>();
  const [docente, setDocente] = useState<Docente>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!id) return;

    fetch(`http://127.0.0.1:8000/docentes/${id}/materias`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener el docente");
        return res.json();
      })
      .then((data) => setDocente(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Cargando docente...</p>;
  if (error) return <p>Error: {error}</p>;

  return <DetalleDocente docente={docente} />;
}
