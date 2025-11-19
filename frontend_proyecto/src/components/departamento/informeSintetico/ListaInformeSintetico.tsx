// src/components/departamento/ListaInformeSintetico.tsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchInformes } from "../../informeSintetico/informesSinteticosCompletados/informesService"; 
import ROUTES from "../../../paths"; 

interface Informe {
  id: number;
  titulo: string;
  anio: number; 
  periodo: string; 
  // Opcional: Si el backend incluye la carrera en el listado
  // carrera: { nombre: string }; 
}

// ⚠️ MOCK: DEBES REEMPLAZAR ESTE VALOR POR EL ID DEL DEPARTAMENTO DEL USUARIO LOGUEADO
// Esto generalmente viene de un Context/Auth o se resuelve en un loader de React Router.
const ID_DEPARTAMENTO_ACTUAL = 1; 

function ListaInformeSintetico() {
  const [informes, setInformes] = useState<Informe[]>([]);

  useEffect(() => {
    // ⬅️ CAMBIO CLAVE: Llamamos al servicio con el ID del departamento
    fetchInformes(ID_DEPARTAMENTO_ACTUAL).then(setInformes); 
  }, []);

  return (
    <div className="container py-4">
      <div className="card">
        <div className="card-header bg-unpsjb-header">
          <h1 className="h4 mb-0">Departamento</h1>
        </div>
        <div className="card-body">
          <h2 className="h5 mb-3">Informes Sintéticos Completados del Departamento</h2>
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
                      <span className="text"> – {inf.periodo} {inf.anio}</span>
                    </div>
                    {/* Asegúrate que el path de detalle de Departamento sea distinto
                        o use el mismo componente de detalle */}
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