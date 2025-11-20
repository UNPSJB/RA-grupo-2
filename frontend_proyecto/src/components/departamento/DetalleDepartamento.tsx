import { useEffect, useState } from "react";
import ListaCarreras from "../carrera/ListarCarreras";
import type { Departamento, Carrera } from "../../types/types";
import { useParams } from "react-router-dom";
import { EsPeriodoInformeSintetico } from "../secretaria/definirFechas/EstamosEnPeriodo"

function DetalleDepartamento() {
  const { id_dpto } = useParams<{ id_dpto: string }>();
  const [departamento, setDepartamento] = useState<Departamento | null>(null);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const periodoInforme = EsPeriodoInformeSintetico();

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/departamentos/${id_dpto}`)
      .then((res) => res.json())
      .then((data) => setDepartamento(data))
      .catch((err) => console.error("Error cargando departamento:", err));

    fetch(`http://127.0.0.1:8000/carreras/departamento/${id_dpto}/informes_pendientes`)
      .then((res) => res.json())
      .then((data) => setCarreras(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error cargando carreras:", err))

  }, [id_dpto]);


  if (!departamento) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning">Cargando departamento..</div>
      </div>
    );
  }

  if (!periodoInforme) {
    return (
      <div className="container py-4">
        <div className="card shadow-sm my-3">
          <div className="card-body text-center">
            <h5 className="mb-0 text-muted">
              El periodo para completar los informes no está abierto
            </h5>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0">
        <div className="card-header bg-unpsjb-header text-white py-3">
          <h1 className="h4 mb-0">
            Departamento de {departamento.nombre}
            {departamento.sede && ` - Sede ${departamento.sede.nombre}`}
          </h1>
        </div>
        <div className="card-body">
          <h2 className="h5 mb-3">Informes sinteticos pendientes:</h2>
          <ListaCarreras carreras={carreras} departamento={departamento} />
        </div>
      </div>
    </div>
  );
}

export default DetalleDepartamento;