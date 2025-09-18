import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import './App.css';
import type { Departamento, Carrera } from "./types/types";

import DetalleDepartamento from "./components/departamento/departamentos";
import InformeSinteticoList from './components/informeSintetico/InformeSinteticoList';
import InformeSinteticoDetail from './components/informeSintetico/InformeSinteticoDetail';

function App() {
  const [departamento, setDepartamento] = useState<Departamento | null>(null);
  const [carreras, setCarreras] = useState<Carrera[]>([]);

  useEffect(() => {

    fetch("http://127.0.0.1:8000/departamentos/1")
      .then((res) => res.json())
      .then((data) => setDepartamento(data))
      .catch((err) => console.error("Error cargando departamento:", err));


    fetch("http://127.0.0.1:8000/carreras/departamento/1")
      .then((res) => res.json())
      .then((data) => setCarreras(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error cargando carreras:", err));
  }, []);

  return (
    <>
      <nav className="p-4 bg-gray-800 text-white flex gap-4">
        <Link to="/">🏠 Home</Link>
        <Link to="/informes">📄 Informes Sintéticos</Link>
      </nav>

      <Routes>
        <Route path="/" element={
          <div className="app-content">
            {departamento ? (
              <DetalleDepartamento departamento={departamento} carreras={carreras} />
            ) : (
              <p>Cargando departamento...</p>
            )}
          </div>
        } />

        <Route path="/informes" element={<InformeSinteticoList />} />
        <Route path="/informes/:id" element={<InformeSinteticoDetail />} />
      </Routes>
    </>
  );
}

export default App;