import { useState, useEffect } from "react";
import EncuestasDisponibles from "./EncuestasDisponibles";
import type { Alumno } from "../../types/types.ts"
import { ALUMNO_ID } from "../../constants.ts"
import { EsPeriodoEncuesta } from "../secretaria/definirFechas/EstamosEnPeriodo"
import PopupPeriodoCerrado from "../secretaria/definirFechas/PopUpPeriodo"

type EncuestaDisponible = {
  materia: string;
  encuesta: string;
  materia_id: number;
  encuesta_id: number;
};

export default function EncuestasPage() {
  const alumnoId = ALUMNO_ID; // hardcodeado por ahora
  const [alumno, setAlumno] = useState<Alumno>()
  const [encuestas, setEncuestas] = useState<EncuestaDisponible[]>([]);
  const periodoEncuesta = EsPeriodoEncuesta();

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/alumnos/${alumnoId}`)
      .then(res => {
        if (!res.ok) throw new Error("Error al obtener el alumno");
        return res.json();
      })
      .then(setAlumno)
      .catch(console.error);

    fetch(`http://127.0.0.1:8000/alumnos/${alumnoId}/encuestas_disponibles`)
      .then((res) => res.json())
      .then((data: EncuestaDisponible[]) => setEncuestas(data))
      .catch((err) => {
        console.error("Error al obtener encuestas:", err);
        setEncuestas([]);
      });
  }, [alumnoId]);

if (!periodoEncuesta) {
  return <PopupPeriodoCerrado msg={"El periodo para contestar las encuestas no está abierto"}/>;
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
