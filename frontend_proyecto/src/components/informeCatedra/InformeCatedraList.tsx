import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchInformesCatedra } from "../informeCatedra/informesService";
import { mostrarPeriodo } from "../informeCatedra/InformeCatedraDetail"

interface InformeCatedra {
  id: number;
  titulo: string;
  anio: number;
  periodo: string;
}

export default function InformeCatedraList() {
  const [informes, setInformes] = useState<InformeCatedra[]>([]);

  useEffect(() => {
    fetchInformesCatedra()
      .then(setInformes)
      .catch(err => console.error("Error al cargar informes:", err));
  }, []);

  return (
    <div className="container py-4">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h1 className="h4 mb-0">Informes de Cátedra</h1>
        </div>
        <div className="card-body">
          {informes.length === 0 ? (
            <p className="text-muted">No hay informes disponibles.</p>
          ) : (
            <div className="list-group">
              {informes.map((inf, i) => (
                <div key={inf.id} className="col-12 mb-3">
                  <div className="card">
                    <div className="card-body d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-muted me-3">{i + 1}.</span>
                        <span className="fw-bold">
                          {inf.titulo} – {inf.anio} ({mostrarPeriodo(inf.periodo)})
                        </span>
                      </div>
                      <Link
                        to={`/informes-catedra/${inf.id}`}
                        className="btn btn-primary btn-sm"
                      >
                        Ver Detalle
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
