import { useEffect, useState } from "react";
import { Link} from "react-router-dom";
import { fetchInformes } from "../../informeSintetico/informesSinteticosCompletados/informesService"; 
import ROUTES from "../../../paths"; 
import type { Departamento } from "../../../types/types";
import { MostrarPeriodo } from "../../../constants";
import api from "../../../services/api"; 
import { useAuth } from "../../../context/AuthContext";

interface Informe {
  id: number;
  titulo: string;
  anio: number; 
  periodo: string; 
}

function ListaInformeSintetico() {
  const [informes, setInformes] = useState<Informe[]>([]);
  const { currentUser } = useAuth();
  const id_dpto = currentUser?.departamento_id;
  const [departamento, setDepartamento] = useState<Departamento | null>(null);

  useEffect(() => {
    const departamentoId = id_dpto; 
    
    if (departamentoId) {
        api.get(`/departamentos/${departamentoId}`)
          .then((res) => setDepartamento(res.data))
          .catch((err) => console.error("Error cargando departamento:", err));
          
        fetchInformes(departamentoId) 
          .then(setInformes)
          .catch((err) => console.error("Error cargando informes completados:", err));

    } else {
        setInformes([]);
        setDepartamento(null);
        console.warn("ID de departamento no disponible en la URL.");
    }
  }, [id_dpto]); 
  
  if (!departamento) {
    return (
      <div className="container py-4">
        <div className="alert alert-info">Cargando informes del departamento...</div>
      </div>
    );
  }

  if(id_dpto)return (
    <div className="container py-4">
      <div className="card">
        <div className="card-header bg-unpsjb-header">
          <h1 className="h4 mb-0">Departamento de {departamento.nombre}</h1>
        </div>
        <div className="card-body">
          <h2 className="h5 mb-3">Informes Sintéticos Completados</h2>
          <div className="list-group">
            {Array.isArray(informes) && informes.map((inf, i) => (
              <div key={inf.id} className="col-12 mb-3">
                <div className="card">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                      <span className="text-muted me-3">{i + 1}.</span>
                      <span className="fw-bold">
                        {inf.titulo} 
                      </span>
                      <span className="text"> – {MostrarPeriodo(inf.periodo)} {inf.anio}</span>
                    </div>
                    <Link
                        to={ROUTES.INFORME_SINTETICO_DETALLE(inf.id)} 
                        className="btn btn-theme-primary rounded-pill px-4"
                        >
                      Ver Informe
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {Array.isArray(informes) && informes.length === 0 && (
                <div className="alert alert-info">No hay informes completados disponibles para este departamento.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListaInformeSintetico;