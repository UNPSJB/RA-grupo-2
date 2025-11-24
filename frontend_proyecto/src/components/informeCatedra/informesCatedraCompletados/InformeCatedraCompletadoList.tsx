import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// instancia api
import api from "../../../services/api"; 
import { MostrarPeriodo } from "../../../constants";
import type { Departamento } from "../../../types/types";
import ROUTES from "../../../paths";

interface InformeCatedraCompletado {
  id: number;
  titulo: string;
  anio: number;
  periodo: string;
}

export default function InformeCatedraList() {
  const [informes, setInformes] = useState<InformeCatedraCompletado[]>([]);
  const [departamento, setDepartamento] = useState<Departamento | null>(null);
  const departamentoId = 1; 

  useEffect(() => {
    api.get(`/departamentos/${departamentoId}`)
      .then(res => setDepartamento(res.data)) 
      .catch(err => console.error("Error cargando departamento:", err));

    api.get(`/informe-catedra-completado/departamento/${departamentoId}`)
      .then(res => setInformes(res.data))
      .catch(err => console.error("Error cargando informes:", err));
      
  }, [departamentoId]);

  return (
    <div className="container py-4">
      <div className="card">
        <div className="card-header bg-unpsjb-header">
          <h1 className="h4 mb-0">
            <strong>Departamento de</strong> {departamento?.nombre}
          </h1>
        </div>
        <div className="card-body">
          <h2 className="h5 mb-3">Informes de Cátedra</h2>
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
                          {inf.titulo} – ({MostrarPeriodo(inf.periodo)})
                        </span>
                      </div>
                      <Link
                        to={ROUTES.INFORME_CATEDRA_DETALLE(departamentoId, inf.id)}
                        className="btn btn-theme-primary rounded-pill px-4"
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