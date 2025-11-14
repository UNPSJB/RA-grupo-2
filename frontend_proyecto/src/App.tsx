import { Routes, Route } from "react-router-dom";
import EncuestasPage from "./components/encuesta/EncuestasPage";
//import EncuestaDetalle from "./components/encuesta/EncuestaDetalle";
import DocentePage from "./components/docente/docentesPage";
import Navbar from "./components/navbar/navbar";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Menu from "./components/menu";
import DetalleDepartamento from "./components/departamento/DetalleDepartamento";
import DetalleCarrera from "./components/carrera/DetalleCarrera";
import InformeSinteticoList from './components/informeSintetico/informesSinteticosCompletados/InformeSinteticoList';
import InformeSinteticoDetail from './components/informeSintetico/informesSinteticosCompletados/InformeSinteticoDetail';
import InformeSinteticoBaseForm from "./components/informeSintetico/InformeSinteticoBaseForm";
//import CrearPreguntaCerrada from './components/pregunta/preguntaCerrada/CrearPreguntaCerrada';
import CompletarEncuesta from "./components/encuesta/completarEncuesta/CompletarEncuesta";

//import SeleccionarTipoPregunta from './components/pregunta/SeleccionarTipoPregunta';
//import CrearPreguntaAbierta from './components/pregunta/preguntaAbierta/CrearPreguntaAbierta';
import EncuestasCompletadasPage from "./components/encuestasCompletadas/EncuestasCompletadasPage";
import EncuestaCompletadaDetalle from "./components/encuestasCompletadas/EncuestaCompletadaDetalle";

import InformeCatedraList from "./components/informeCatedra/informesCatedraCompletados/InformeCatedraCompletadoList";
import InformeCatedraDetail from "./components/informeCatedra/informesCatedraCompletados/InformeCatedraCompletadoDetail";
import InformeCatedraBaseForm from "./components/informeCatedra/InformeCatedraBaseForm";
import InformeCatedraCompletadoDocente from "./components/docente/informesCompletados/mostrarInformesCompletados";

//import DatosEstadisticosPage from "./components/datosEstadisticos/DatosEstadisticosPage";

import InformeForm from "./components/docente/informe/CompletarInformeCatedra";
import InformesPendientesPage from "./components/docente/informe/InformesPendientesPage";
import CompletarInformeSintetico from "./components/informeSintetico/completarInformeSintetico/CompletarInformeSintetico";
import AsignarFormularios from "./components/secretaria/asignarMateriaInforme";

import EncuestaBaseForm from "./components/encuesta/crearEncuestaForm";
import DetalleMateria from "./components/materia/DetalleMateria";
import Footer from "./components/footer/footer";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


import ROUTES from "./paths";

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
            container: ¿Centra el contenido y da un ancho máximo
          */}
          <Routes>
            <Route path={ROUTES.HOME} element={<Menu />} />
            <Route path={ROUTES.CARRERAS_DPTO()} element={<DetalleDepartamento />} />
            <Route path={ROUTES.CARRERA()} element={<DetalleCarrera />} />
            <Route path={ROUTES.COMPLETAR_INFORME_SINTETICO} element={<CompletarInformeSintetico />} />
            <Route path={ROUTES.ENCUESTAS_DISPONIBLES} element={<EncuestasPage />} />
            <Route path={ROUTES.MATERIAS_ASIGNADAS()} element={<DocentePage />} />
            <Route path={ROUTES.DETALLE_MATERIA()} element={<DetalleMateria />} />
            <Route path={ROUTES.INFORMES_SINTETICOS} element={<InformeSinteticoList />} />
            <Route path={ROUTES.INFORME_SINTETICO_DETALLE()} element={<InformeSinteticoDetail />} />
            <Route path={ROUTES.COMPLETAR_ENCUESTA} element={<CompletarEncuesta />} />
            <Route path={ROUTES.ENCUESTAS_COMPLETADAS} element={<EncuestasCompletadasPage />} />
            <Route path={ROUTES.ENCUESTA_COMPLETADA_DETALLE()} element={<EncuestaCompletadaDetalle />} />
            <Route path={ROUTES.INFORMES_CATEDRA} element={<InformeCatedraList />} />
            <Route path={ROUTES.INFORME_CATEDRA_DETALLE()} element={<InformeCatedraDetail />} />
            <Route path={ROUTES.INFORME_CATEDRA_BASE_NUEVO} element={<InformeCatedraBaseForm />} />
            <Route path={ROUTES.INFORMES_CATEDRA_PENDIENTES} element={<InformesPendientesPage />} />
            
            <Route path={ROUTES.INFORME_CATEDRA_COMPLETADO_DETALLE()} element={<InformeCatedraDetail />} />
            <Route path={ROUTES.INFORMES_CATEDRA_COMPLETADOS} element={<InformeCatedraCompletadoDocente />} />
            <Route path={ROUTES.ASIGNAR_MATERIA_INFORME} element={<AsignarFormularios />} />
            <Route path={ROUTES.COMPLETAR_INFORME_CATEDRA} element={<InformeForm />} />
            <Route path={ROUTES.ENCUESTA_BASE_NUEVA} element={<EncuestaBaseForm />} />
            <Route path={ROUTES.INFORME_SINTETICO_BASE_NUEVO} element={<InformeSinteticoBaseForm />} />
          </Routes>
        </div>
      </main>
      
      {/* Footer que siempre está abajo */}
      <Footer />
    </div>
  );
}

export default App;