import { Routes, Route } from "react-router-dom";
import EncuestasPage from "./components/EncuestasPage";
import EncuestaDetalle from "./components/EncuestaDetalle";
import DocentePage from "./components/docente/docentesPage";
import Menu from "./components/menu";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/encuestas" element={<EncuestasPage />} />
        <Route path="/encuestas/:id" element={<EncuestaDetalle />} />
        <Route path="/docentes/:id" element={<DocentePage />} />
      </Routes>
    </div>
  );
}

export default App;

