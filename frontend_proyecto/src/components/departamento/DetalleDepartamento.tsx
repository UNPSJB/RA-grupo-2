import { useEffect, useState } from "react";
import ListaCarreras from "../carrera/ListarCarreras";
import type { Departamento, Carrera } from "../../types/types";
import { useParams } from "react-router-dom";
import { EsPeriodoInformeSintetico } from "../secretaria/definirFechas/EstamosEnPeriodo"
import PopupPeriodoCerrado from "../secretaria/definirFechas/PopUpPeriodo"
import api from "../../services/api";

function DetalleDepartamento() {
  const { id_dpto } = useParams<{ id_dpto: string }>();
  const [departamento, setDepartamento] = useState<Departamento | null>(null);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const periodoInforme = EsPeriodoInformeSintetico();

  useEffect(() => {
    api.get(`/departamentos/${id_dpto}`)
      .then((res) => setDepartamento(res.data))
      .catch((err) => console.error("Error cargando departamento:", err));

    api.get(`/carreras/departamento/${id_dpto}/informes_pendientes`)
      .then((res) => setCarreras(Array.isArray(res.data) ? res.data : []))
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
    return <PopupPeriodoCerrado msg={"El periodo para completar los informes no está abierto"}/>;
  }

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0">
        <div className="card-header bg-unpsjb-header">
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