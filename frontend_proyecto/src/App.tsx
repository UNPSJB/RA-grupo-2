import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import EncuestasPage from "./components/EncuestasPage";
import EncuestaDetalle from "./components/EncuestaDetalle";
import DocentePage from "./components/docente/docentesPage";
import Menu from "./components/menu";
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
    <div>
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/departamento" element={
          <div className="app-content">
            {departamento ? (
              <DetalleDepartamento departamento={departamento} carreras={carreras} />
            ) : (
              <p>Cargando departamento...</p>
            )}
          </div>
        } />
        <Route path="/encuestas" element={<EncuestasPage />} />
        <Route path="/encuestas/:id" element={<EncuestaDetalle />} />
        <Route path="/docentes/:id" element={<DocentePage />} />
        <Route path="/informes" element={<InformeSinteticoList />} />
        <Route path="/informes/:id" element={<InformeSinteticoDetail />} />
      </Routes>
    </div>
  );
}

export default App;

