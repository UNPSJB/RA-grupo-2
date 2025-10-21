import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchInformeCatedra } from "./informesService";

interface InformeCatedraCompletado {
  id: number;
  titulo: string;
  contenido: string;
  anio: number;
  periodo: string;
}
export function mostrarPeriodo(periodo: string) {
  switch (periodo) {
    case "PRIMER_CUATRI":
      return "Primer Cuatrimestre";
    case "SEGUNDO_CUATRI":
      return "Segundo Cuatrimestre";
    case "ANUAL":
      return "Anual";
    default:
      return periodo;
  }
}

export default function InformeCatedraDetail() {
  const { id } = useParams<{ id: string }>();
  const [informe, setInforme] = useState<InformeCatedraCompletado | null>(null);

  useEffect(() => {
    if (id) {
      fetchInformeCatedra(id)
        .then(setInforme)
        .catch(err => console.error("Error al cargar informe:", err));
    }
  }, [id]);

  if (!informe) return <p className="p-6">Cargando...</p>;

  return (
    <div className="container py-4">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h1 className="h4 mb-0">{informe.titulo}</h1>
        </div>
        <div className="card-body">
          <p className="mb-2">
            <strong>Año:</strong> {informe.anio}
          </p>
          <p className="mb-2">
            <strong>Período:</strong> {mostrarPeriodo(informe.periodo)}
          </p>
          <div className="alert alert-info mt-3">
            <strong>Contenido:</strong> <br /> {informe.contenido}
          </div>
        </div>
      </div>
    </div>
  );
}
