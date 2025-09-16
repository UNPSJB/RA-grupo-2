// App.tsx
import { useEffect, useState } from "react";
//import ListaMaterias from "./components/materia/materias";
import DetalleDocente from "./components/docente/docentes";

interface Materia {
  id: number;
  matricula: string;
  nombre: string;
}

interface Docente {
  docente_id: number;
  nombre: string;
  apellido: string;
  materias: Materia[]
  
}
function App() {
  const [docente, setDocente] = useState<Docente>();

  useEffect(() => {
    fetch("http://127.0.0.1:8000/docentes/1/materias")
      .then((res) => res.json())
      .then((data) => setDocente(data))
      .catch((err) => console.error("Error al obtener materias:", err));
  }, []);

  return (
    <div>
      <DetalleDocente docente={docente}/>
    </div>
  );
}

export default App;
