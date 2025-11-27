import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
//instancia api
import api from "../../../services/api";
import { MostrarPeriodo } from "../../../constants";
import type { Docente } from "../../../types/types";
import ROUTES from "../../../paths";
import { useAuth } from "../../../context/AuthContext";

interface InformeCatedraCompletado {
  id: number;
  titulo: string;
  anio: number;
  periodo: string;
}

export default function InformeCatedraCompletadoDocente() {
  const [informes, setInformes] = useState<InformeCatedraCompletado[]>([]);
  const { currentUser } = useAuth();
  const docenteId = currentUser?.docente_id;
  const [docente, setDocente] = useState<Docente>();

  useEffect(() => {
    api.get(`/docentes/${docenteId}`)
      .then(res => setDocente(res.data))
      .catch(err => console.error("Error al obtener el docente:", err));
    api.get(`/informe-catedra-completado/docente/${docenteId}/completados`)
      .then(res => setInformes(res.data))
      .catch(err => console.error("Error al obtener los informes del docente:", err));
  }, [docenteId]);

  return (
    <div className="container py-4">
      <div className="card">
        <div className="card-header bg-unpsjb-header">
          <h1 className="h4 mb-0">
            <strong>Docente:</strong> {docente?.nombre} {docente?.apellido}
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
                          {inf.titulo} – ({MostrarPeriodo(inf.periodo)})
                        </span>
                      </div>
                      <Link
                        to={ROUTES.INFORME_CATEDRA_COMPLETADO_DETALLE(inf.id)}
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
