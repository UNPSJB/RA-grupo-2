import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchInforme } from "./informesService";

interface Informe {
  id: number;
  titulo: string;
  descripcion: string;
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
    <div className="p-6">
      <h1 className="text-2xl font-bold">{informe.titulo}</h1>
      <p className="text-gray-600">📅 Fecha: {informe.fecha}</p>
      <p className="mt-4">{informe.descripcion}</p>
    </div>
  );
}

export default InformeSinteticoDetail;
