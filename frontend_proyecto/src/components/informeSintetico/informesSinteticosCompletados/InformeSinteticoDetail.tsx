import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchInforme } from "./informesService"

interface Informe {
  id: number;
  titulo: string;
  contenido: string;
  anio: number;
  periodo: string;
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
    <div className="card">
      <div className="card-header bg-unpsjb-header">
        <h1 className="h4 mb-0">{informe.titulo}</h1>
      </div>
      <div className="card-body">
        <p className="mb-2">
          <strong>Periodo:</strong> {informe.periodo} {informe.anio}
        </p>
        <div className="alert alert-info">
          <strong>Descripción:</strong> {informe.contenido}
        </div>
      </div>
    </div>
  </div>
);
}
export default InformeSinteticoDetail;