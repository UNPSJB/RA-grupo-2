import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PERIODO_ACTUAL } from "../../../constants";
import type { Departamento } from "../../../types/types";
import ROUTES from "../../../paths";

interface InformeCatedraCompletado {
  id: number;
  titulo: string;
  anio: number;
  periodo: string;
}

export default function InformeCatedraCompletadoDocente() {
  const [informes, setInformes] = useState<InformeCatedraCompletado[]>([]);
  const [departamento, setDepartamento] = useState<Departamento | null>(null);

  const departamentoId = 1; 
  const docenteId = 2; // hardcoedado 

  useEffect(() => {
    // Obtener info del departamento para mostrarlo (opcional)
    fetch(`http://127.0.0.1:8000/departamentos/${departamentoId}`)
      .then(res => res.json())
      .then(setDepartamento)
      .catch(console.error);

    // Informes completados del docente
    fetch(`http://127.0.0.1:8000/informe-catedra-completado/docente/${docenteId}/completados`)
      .then(res => {
        if (!res.ok) throw new Error("Error al obtener los informes del docente");
        return res.json();
      })
      .then(setInformes)
      .catch(console.error);
  }, [departamentoId, docenteId]);

  return (
    <div className="container py-4">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h1 className="h4 mb-0">
            <strong>Departamento de</strong> {departamento?.nombre}
          </h1>
        </div>
        <div className="card-body">
          <h2 className="h5 mb-3">Informes de Cátedra Completados</h2>

          {informes.length === 0 ? (
            <p className="text-muted">No ha completado informes de catedra.</p>
          ) : (
            <div className="list-group">
              {informes.map((inf, i) => (
                <div key={inf.id} className="col-12 mb-3">
                  <div className="card">
                    <div className="card-body d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-muted me-3">{i + 1}.</span>
                        <span className="fw-bold">
                          {inf.titulo} – {inf.anio} ({PERIODO_ACTUAL})
                        </span>
                      </div>
                      <Link
                        to={ROUTES.INFORME_CATEDRA_COMPLETADO_DETALLE(inf.id)}
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
