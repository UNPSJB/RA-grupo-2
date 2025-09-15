import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

type EncuestaDisponible = {
  materia: string;
  encuesta: string;
};

export default function EncuestaDetalle() {
  const { id } = useParams(); // índice en el array
  const navigate = useNavigate();
  const alumnoId = 3;

  const [, setEncuestas] = useState<EncuestaDisponible[]>([]);
  const [seleccionada, setSeleccionada] = useState<EncuestaDisponible | null>(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/alumnos/${alumnoId}/encuestas_disponibles`)
      .then((res) => res.json())
      .then((data: EncuestaDisponible[]) => {
        setEncuestas(data);
        if (id !== undefined && data[parseInt(id)] !== undefined) {
          setSeleccionada(data[parseInt(id)]);
        }
      })
      .catch((err) => {
        console.error("Error al obtener encuesta:", err);
        setEncuestas([]);
      });
  }, [alumnoId, id]);

  if (!seleccionada) {
    return <p>No se encontró la encuesta</p>;
  }

  return (
    <div>
      <h1>Encuesta seleccionada</h1>
      <p>
        <b>Materia:</b> {seleccionada.materia}
      </p>
      <p>
        <b>Encuesta:</b> {seleccionada.encuesta}
      </p>

      <button onClick={() => navigate("/encuestas")}>Volver atrás</button>
    </div>
  );
}
