import './App.css'
import { Routes, Route, Navigate } from "react-router-dom";
import EncuestasPage from "./components/EncuestasPage";
import EncuestaDetalle from "./components/EncuestaDetalle";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/encuestas" />} />
      <Route path="/encuestas" element={<EncuestasPage />} />
      <Route path="/encuestas/:id" element={<EncuestaDetalle />} />
    </Routes>
  );
}

export default App