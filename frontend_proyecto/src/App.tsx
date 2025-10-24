import { Routes, Route } from "react-router-dom";
import EncuestasPage from "./components/encuesta/EncuestasPage";
import EncuestaDetalle from "./components/encuesta/EncuestaDetalle";
import DocentePage from "./components/docente/docentesPage";
import Navbar from "./components/navbar/navbar";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Menu from "./components/menu";
import DetalleDepartamento from "./components/departamento/DetalleDepartamento";
import DetalleCarrera from "./components/carrera/DetalleCarrera";
import InformeSinteticoList from './components/informeSintetico/InformeSinteticoList';
import InformeSinteticoDetail from './components/informeSintetico/InformeSinteticoDetail';
import CrearPreguntaCerrada from './components/pregunta/preguntaCerrada/CrearPreguntaCerrada';
import CompletarEncuesta from "./components/encuesta/completarEncuesta/CompletarEncuesta";

import SeleccionarTipoPregunta from './components/pregunta/SeleccionarTipoPregunta';
import CrearPreguntaAbierta from './components/pregunta/preguntaAbierta/CrearPreguntaAbierta';
import EncuestasCompletadasPage from "./components/encuestasCompletadas/EncuestasCompletadasPage";
import EncuestaCompletadaDetalle from "./components/encuestasCompletadas/EncuestaCompletadaDetalle";

import InformeCatedraList from "./components/informeCatedra/informesCatedraCompletados/InformeCatedraCompletadoList";
import InformeCatedraDetail from "./components/informeCatedra/informesCatedraCompletados/InformeCatedraCompletadoDetail";
import InformeCatedraBaseForm from "./components/informeCatedra/InformeCatedraBaseForm";

import DatosEstadisticosPage from "./components/datosEstadisticos/DatosEstadisticosPage";

import InformeForm from "./components/docente/informe/CompletarInformeCatedra";
import InformesPendientesPage from "./components/docente/informe/InformesPendientesPage";


import DetalleMateria from "./components/materia/DetalleMateria";
import Footer from "./components/footer/footer";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Navbar fijo arriba */}
      <Navbar />
      
      {/* Contenido principal*/}
      <main className="flex-grow-1 container-fluid mt-5 pt-4">
        {/* 
          container-fluid: Ocupa todo el ancho pero con padding
          mt-5: Margin-top grande para separar del navbar
          pt-4: Padding-top adicional
          flex-grow-1: Ocupa todo el espacio disponible
        */}
        
        <div className="container">
          {/* 
            container: Centra el contenido y da un ancho máximo
          */}
          <Routes>
            <Route path="/" element={<Menu />} />
            <Route path="/departamento" element={<DetalleDepartamento />} />
            <Route path="/carrera/:id" element={<DetalleCarrera />} />
            <Route path="/encuestas" element={<EncuestasPage />} />
            <Route path="/encuestas/:id" element={<EncuestaDetalle />} />
            <Route path="/docentes/:id" element={<DocentePage />} />
            <Route path="/detallemateria/:id" element={<DetalleMateria />} />
            <Route path="/informes" element={<InformeSinteticoList />} />
            <Route path="/informes/:id" element={<InformeSinteticoDetail />} />
            <Route path="/preguntas/crear" element={<SeleccionarTipoPregunta />} />
            <Route path="/pregunta/cerrada" element={<CrearPreguntaCerrada />} />
            <Route path="/pregunta/abierta" element={<CrearPreguntaAbierta />} />
            <Route path="/encuestas/categoria-b" element={<CompletarEncuesta />} />
            <Route path="/encuestas-completadas" element={<EncuestasCompletadasPage />} />
            <Route path="/encuestas-completadas/:id" element={<EncuestaCompletadaDetalle />} />
            <Route path="/informes-catedra" element={<InformeCatedraList />} />
            <Route path="/informes-catedra/:id" element={<InformeCatedraDetail />} />
            <Route path="/datos-estadisticos" element={<DatosEstadisticosPage />} />
            <Route path="/informes-catedra-base" element={<InformeCatedraBaseForm />} />
            <Route path="/informes-catedra-base/nuevo" element={<InformeCatedraBaseForm />} />
            <Route path="/docentes/informes-pendientes" element={<InformesPendientesPage />} />
            <Route path="/docentes/informe/completar" element={<InformeForm />} />

          </Routes>
        </div>
      </main>
      
      {/* Footer que siempre está abajo */}
      <Footer />
    </div>
  );
}

export default App;