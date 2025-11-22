import { useEffect, useState } from "react";
//instancia api
import api from "../../services/api";
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
    api.get(`/docentes/${docenteId}/materias`)
      .then((res) => {
        setDocente(res.data);
      })
      .catch((err) => {
        console.error("Error al obtener el docente:", err);
        const errorMsg = err.response?.data?.detail || err.message || "Error al obtener el docente";
        setError(errorMsg);
      })
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