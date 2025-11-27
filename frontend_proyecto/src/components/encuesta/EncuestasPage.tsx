import { useState, useEffect } from "react";
import EncuestasDisponibles from "./EncuestasDisponibles";
import type { Alumno } from "../../types/types.ts"
import { EsPeriodoEncuesta } from "../secretaria/definirFechas/EstamosEnPeriodo"
import PopupPeriodoCerrado from "../secretaria/definirFechas/PopUpPeriodo"
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

type EncuestaDisponible = {
  materia: string;
  encuesta: string;
  materia_id: number;
  encuesta_id: number;
};

export default function EncuestasPage() {
  const { currentUser } = useAuth();
  const alumnoId = currentUser?.alumno_id;
  const [alumno, setAlumno] = useState<Alumno>()
  const [encuestas, setEncuestas] = useState<EncuestaDisponible[]>([]);
  const periodoEncuesta = EsPeriodoEncuesta();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!alumnoId) return;
    api.get(`/alumnos/${alumnoId}`)
      .then(res => {
        setAlumno(res.data);
      })
      .catch(console.error);

    api.get(`/alumnos/${alumnoId}/encuestas_disponibles`)
      .then((res) => {
        const data: EncuestaDisponible[] = res.data;
        setEncuestas(data);
      })
      .catch((err) => {
        console.error("Error al obtener encuestas:", err);
        setEncuestas([]);
      })
      .finally(() => setLoading(false));
  }, [alumnoId]);

  if (loading) {
    return (
      <div className="text-center mt-4">Cargando informes pendientes...</div>
    );
  }

  if (!alumnoId) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger" role="alert">
          No se pudo obtener la información del alumno. Por favor, inicie sesión nuevamente.
        </div>
      </div>
    );
  }

  if (!periodoEncuesta) {
    return <PopupPeriodoCerrado msg={"El periodo para contestar las encuestas no está abierto"} />;
  }

  return (
    <div className="container py-4">
      <div className="card">
        <div className="card-header bg-unpsjb-header">
          <h1 className="h4 mb-0">Alumno {alumno?.nombre} {alumno?.apellido}</h1>
        </div>
        <div className="card-body">
          <h2 className="h5 mb-3">Encuestas disponibles:</h2>
          <EncuestasDisponibles
            encuestas={encuestas}
            alumnoId={alumnoId}
          />
        </div>
      </div>
    </div>
  );
}