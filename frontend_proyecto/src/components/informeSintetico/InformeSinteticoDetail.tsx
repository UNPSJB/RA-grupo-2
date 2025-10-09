import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchInforme } from "./informesService";

interface Informe {
  id: number;
  titulo: string;
  contenido: string;
  fecha: string;
}

function InformeSinteticoDetail() {
  const { id } = useParams<{ id: string }>();
  const [informe, setInforme] = useState<Informe | null>(null);

  useEffect(() => {
    if (id) {
      fetchInforme(id).then(setInforme);
    }
  }, [id]);

  if (!informe) return <p className="p-6">Cargando...</p>;

return (
  <div className="container py-4">
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white">
        <h1 className="h5 mb-0 fw-semibold">{informe.titulo}</h1>
      </div>

      <div className="card-body">
        <p className="mb-2">
          <span className="fw-semibold text-secondary">Fecha:</span>{" "}
          <span className="text-dark">{informe.fecha}</span>
        </p>

        <div className="alert alert-info">
          <span className="fw-semibold text-secondary">Descripción:</span>{" "}
          <span className="text-dark">{informe.contenido}</span>
        </div>
      </div>
    </div>
  </div>
);


}

export default InformeSinteticoDetail;
