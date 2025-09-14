import { useState, useEffect } from 'react'
import './App.css'
import EncuestasAlumno from "./components/EncuestasDisponibles"; 

type EncuestaDisponible = {
  materia: string;
  encuesta: string;
};

function App() {
  const alumnoId = 3; // hardcodeado por ahora
  const [encuestas, setEncuestas] = useState<EncuestaDisponible[]>([]);
  const [seleccionada, setSeleccionada] = useState<EncuestaDisponible | null>(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/alumnos/${alumnoId}/encuestas_disponibles`)
      .then((res) => res.json())
      .then((data: EncuestaDisponible[]) => setEncuestas(data))
      .catch((err) => {
        console.error("Error al obtener encuestas:", err);
        setEncuestas([]); // 👈 para que no crashee
      });
  }, [alumnoId]);

  if (seleccionada) { //ahora muestra solo la misma encuesta, después acá deberíamos poner para completarla
    return (
      <div>
        <h1>Encuesta seleccionada</h1>
        <p>
          <b>Materia:</b> {seleccionada.materia}
        </p>
        <p>
          <b>Encuesta:</b> {seleccionada.encuesta}
        </p>

        <button onClick={() => setSeleccionada(null)}>
          Volver atrás
        </button>

      </div>
    );
  }

  return (
    <div className="App">
      <h1>Encuestas disponibles para el alumno {alumnoId}</h1>
      <EncuestasAlumno encuestas={encuestas} onSelect={setSeleccionada}/>
    </div>
  )
}

export default App