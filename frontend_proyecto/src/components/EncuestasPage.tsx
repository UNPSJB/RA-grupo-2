import { useState, useEffect } from "react";
import EncuestasDisponibles from "./EncuestasDisponibles";

type EncuestaDisponible = {
  materia: string;
  encuesta: string;
};

export default function EncuestasPage() {
  const alumnoId = 3; // hardcodeado por ahora
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
    <div>
      <h1>Encuestas disponibles para el alumno {alumnoId}</h1>
      <EncuestasDisponibles encuestas={encuestas} />
    </div>
  );
}
