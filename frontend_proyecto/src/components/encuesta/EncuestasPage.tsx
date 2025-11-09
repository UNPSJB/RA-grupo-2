import { useState, useEffect } from "react";
import EncuestasDisponibles from "./EncuestasDisponibles";

type EncuestaDisponible = {
  materia: string;
  encuesta: string;
  materia_id: number;
  encuesta_id: number;
};

export default function EncuestasPage() {
  const alumnoId = 2; // hardcodeado por ahora
  const [encuestas, setEncuestas] = useState<EncuestaDisponible[]>([]);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/alumnos/${alumnoId}/encuestas_disponibles`)
      .then((res) => res.json())
      .then((data: EncuestaDisponible[]) => setEncuestas(data))
      .catch((err) => {
        console.error("Error al obtener encuestas:", err);
        setEncuestas([]);
      });
  }, [alumnoId]);

  return (
    <div className="container py-4">
        <div className="card">
          <div className="card-header bg-unpsjb-header">
            <h1 className="h4 mb-0">Alumno {alumnoId}</h1>
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
