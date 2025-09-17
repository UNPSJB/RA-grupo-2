import "./App.css";
import { useEffect, useState } from "react";
import DetalleDepartamento from "./components/departamento/departamentos";
import type { Departamento, Carrera } from "./types/types";

function App() {
  const [departamento, setDepartamento] = useState<Departamento | null>(null);
  const [carreras, setCarreras] = useState<Carrera[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/departamentos/1")
      .then((res) => res.json())
      .then((data) => {
        console.log("Departamento:", data);
        setDepartamento(data);
      })
      .catch((err) => console.error("Error cargando departamento:", err));

    fetch("http://127.0.0.1:8000/carreras/departamento/1")
      .then((res) => res.json())
      .then((data) => {
        console.log("Carreras:", data);
        setCarreras(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Error cargando carreras:", err));
  }, []);

  return (
    <div>
      {departamento ? (
        <DetalleDepartamento departamento={departamento} carreras={carreras} />
      ) : (
        <p>Cargando departamento...</p>
      )}
    </div>
  );
}

export default App;
