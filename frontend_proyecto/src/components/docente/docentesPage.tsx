import { useEffect, useState } from "react";
//import { useParams } from "react-router-dom";
import DetalleDocente from "./docentes";
import type { Docente } from "../../types/types";
import { DOCENTE_ID } from "../../constants";

export default function DocentePage() {
  const docenteId = DOCENTE_ID;
  const [docente, setDocente] = useState<Docente>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!docenteId) return;

    fetch(`http://127.0.0.1:8000/docentes/${docenteId}/materias`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener el docente");
        return res.json();
      })
      .then((data) => setDocente(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [docenteId]);

  if (loading) {
    return (
      <div className="container py-4">
        <div className="card">
          <div className="card-body text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-2">Cargando docente...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error){
    return (
      <div className="container py-4">
        <div className="alert alert-danger text-center">{error}</div>
      </div>
    );
  }
  return <DetalleDocente docente={docente} />;
}
