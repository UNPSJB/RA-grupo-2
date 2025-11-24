import { useState, useEffect } from "react";
import EncuestasCompletadas from "./EncuestasCompletadas";
import type {Alumno} from "../../types/types.ts"
import {ALUMNO_ID} from "../../constants.ts"
import api from "../../services/api";

type Respuesta = {
  id: number;
  pregunta_id: number;
  opcion_id: number[];
  texto_respuesta: string;
  encuesta_completada_id: number;
}

type EncuestaCompletada = {
  id: number;
  alumno_id: number;
  encuesta_id: number;
  materia_id: number;
  anio: number;
  periodo: string;
  respuestas: Respuesta[];
};

export default function EncuestasCompletadasPage() {
  const alumnoId = ALUMNO_ID; // hardcodeado por ahora
  const [alumno, setAlumno] = useState<Alumno>()
  const [encuestas, setEncuestas] = useState<EncuestaCompletada[]>([]);

  useEffect(() => {
    api.get(`/alumnos/${alumnoId}`)
    .then(res => {
      setAlumno(res.data);
    })
    .catch(console.error);

    api.get(`/encuesta-completada/alumno/${alumnoId}`)
      .then((res) => {
        const data: EncuestaCompletada[] = res.data;
        setEncuestas(data);
      })
      .catch((err) => {
        console.error("Error al obtener encuestas:", err);
        setEncuestas([]);
      });
  }, [alumnoId]);

  return (
    <div className="container py-4">
        <div className="card">
          <div className="card-header bg-unpsjb-header">
            <h1 className="h4 mb-0">Alumno {alumno?.nombre} {alumno?.apellido}</h1>
          </div>
          <div className="card-body">
            <h2 className="h5 mb-3">Encuestas Completadas</h2>
            <EncuestasCompletadas
              encuestas={encuestas}
              />
          </div>
        </div>
      </div>
  );
}