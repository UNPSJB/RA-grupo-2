import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchInformes } from "./informesService";

interface Informe {
  id: number;
  titulo: string;
  fecha: string;
}

function InformeSinteticoList() {
  const [informes, setInformes] = useState<Informe[]>([]);

  useEffect(() => {
    fetchInformes().then(setInformes);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">📄 Informes Sintéticos</h1>
      <ul className="space-y-2">
        {informes.map((inf) => (
          <li key={inf.id} className="border p-2 rounded">
            <Link to={`/informes/${inf.id}`} className="text-blue-600 hover:underline">
              {inf.titulo} - {inf.fecha}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default InformeSinteticoList;
