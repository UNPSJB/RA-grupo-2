import { Routes, Route } from "react-router-dom";
import EncuestasPage from "./components/encuesta/EncuestasPage";
import EncuestaDetalle from "./components/encuesta/EncuestaDetalle";
import DocentePage from "./components/docente/docentesPage";
import Menu from "./components/menu";
import './App.css';
import DetalleDepartamento from "./components/departamento/DetalleDepartamento";
import CarrerasPage from "./components/carrera/CarrerasPage";
import DetalleCarrera from "./components/carrera/DetalleCarrera";
import InformeSinteticoList from './components/informeSintetico/InformeSinteticoList';
import InformeSinteticoDetail from './components/informeSintetico/InformeSinteticoDetail';


function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/departamento" element={<DetalleDepartamento />} />
        <Route path="/carreras" element={<CarrerasPage />} />
        <Route path="/carrera/:id" element={<DetalleCarrera />} />
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

