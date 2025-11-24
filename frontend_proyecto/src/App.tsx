import { Routes, Route, Navigate } from "react-router-dom";
import ROUTES from "./paths";

// --- GUARDIANES DE SEGURIDAD ---
import AuthLayout from "./components/guards/AuthLayout";
import { ProtectedRoute } from "./components/guards/ProtectedRoute";

// --- PAGINAS COMUNES ---
import LoginPage from "./components/login/LoginPage";
import Menu from "./components/menu";

// --- PAGINAS ALUMNOS ---
import EncuestasPage from "./components/encuesta/EncuestasPage";
import CompletarEncuesta from "./components/encuesta/completarEncuesta/CompletarEncuesta";
import EncuestasCompletadasPage from "./components/encuestasCompletadas/EncuestasCompletadasPage";
import EncuestaCompletadaDetalle from "./components/encuestasCompletadas/EncuestaCompletadaDetalle";

// --- PAGINAS DOCENTES ---
import DocentePage from "./components/docente/docentesPage";
import DetalleMateria from "./components/materia/DetalleMateria";
import InformesPendientesPage from "./components/docente/informe/InformesPendientesPage";
import InformeForm from "./components/docente/informe/CompletarInformeCatedra"; // Completar informe cátedra
import InformeCatedraCompletadoDocente from "./components/docente/informesCompletados/mostrarInformesCompletados";

// --- PAGINAS DEPARTAMENTO / SECRETARIA ---
import DetalleDepartamento from "./components/departamento/DetalleDepartamento";
import DetalleCarrera from "./components/carrera/DetalleCarrera";
import InformeSinteticoList from './components/informeSintetico/informesSinteticosCompletados/InformeSinteticoList';
import InformeSinteticoDetail from './components/informeSintetico/informesSinteticosCompletados/InformeSinteticoDetail';
import CompletarInformeSintetico from "./components/informeSintetico/completarInformeSintetico/CompletarInformeSintetico";
import DashboardDepartamento from "./components/departamento/DashboardDpto";
import InformeCatedraList from "./components/informeCatedra/informesCatedraCompletados/InformeCatedraCompletadoList";
import InformeCatedraDetail from "./components/informeCatedra/informesCatedraCompletados/InformeCatedraCompletadoDetail";
import ListaInformeSintetico from "./components/departamento/informeSintetico/ListaInformeSintetico";

// --- PAGINAS EXCLUSIVAS SECRETARIA ---
import InformeCatedraBaseForm from "./components/informeCatedra/InformeCatedraBaseForm";
import EncuestaBaseForm from "./components/encuesta/crearEncuestaForm";
import InformeSinteticoBaseForm from "./components/informeSintetico/InformeSinteticoBaseForm";
import AsignarFormularios from "./components/secretaria/asignarMateriaInforme";
import DefinirFechas from "./components/secretaria/definirFechas/definirFechas";


function App() {
  return (
    <Routes>
      {/* =========================================
          1. RUTAS PÚBLICAS
         ========================================= */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      
      {/* Redirección por defecto: La raíz va al Login */}
      <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />


      {/* =========================================
          2. RUTAS PRIVADAS (Requieren Login)
          El AuthLayout ya incluye el Navbar y Footer
         ========================================= */}
      <Route element={<AuthLayout />}>
        
        {/* A. Rutas Accesibles para TODOS los logueados */}
        <Route path={ROUTES.HOME} element={<Menu />} />
        {/* Aquí irían rutas como "Perfil" o "Cambiar contraseña" */}


        {/* B. Rutas de ALUMNOS */}
        <Route element={<ProtectedRoute allowedRoles={['alumno', 'admin']} />}>
            <Route path={ROUTES.ENCUESTAS_DISPONIBLES} element={<EncuestasPage />} />
            <Route path={ROUTES.COMPLETAR_ENCUESTA} element={<CompletarEncuesta />} />
            <Route path={ROUTES.ENCUESTAS_COMPLETADAS} element={<EncuestasCompletadasPage />} />
            <Route path={ROUTES.ENCUESTA_COMPLETADA_DETALLE()} element={<EncuestaCompletadaDetalle />} />
        </Route>


        {/* C. Rutas de DOCENTES */}
        <Route element={<ProtectedRoute allowedRoles={['docente', 'admin']} />}>
            <Route path={ROUTES.MATERIAS_ASIGNADAS()} element={<DocentePage />} />
            <Route path={ROUTES.DETALLE_MATERIA()} element={<DetalleMateria />} />
            <Route path={ROUTES.INFORMES_CATEDRA_PENDIENTES} element={<InformesPendientesPage />} />
            <Route path={ROUTES.COMPLETAR_INFORME_CATEDRA} element={<InformeForm />} />
            <Route path={ROUTES.INFORMES_CATEDRA_COMPLETADOS} element={<InformeCatedraCompletadoDocente />} />
            {/* Nota: El detalle del informe completado lo usan tanto docentes como deptos */}
            <Route path={ROUTES.INFORME_CATEDRA_COMPLETADO_DETALLE()} element={<InformeCatedraDetail />} />
        </Route>


        {/* D. Rutas de DEPARTAMENTO (Y Secretaria) */}
        <Route element={<ProtectedRoute allowedRoles={['departamento', 'secretaria_academica', 'admin']} />}>
             <Route path={ROUTES.CARRERAS_DPTO()} element={<DetalleDepartamento />} />
             <Route path={ROUTES.CARRERA()} element={<DetalleCarrera />} />
             <Route path={ROUTES.DASHBOARD_DPTO} element={<DashboardDepartamento />} />
             
             {/* Gestión de Informes (Lectura/Listados) */}
             <Route path={ROUTES.INFORMES_CATEDRA} element={<InformeCatedraList />} />
             <Route path={ROUTES.INFORME_CATEDRA_DETALLE()} element={<InformeCatedraDetail />} />
             
             <Route path={ROUTES.INFORMES_SINTETICOS} element={<InformeSinteticoList />} />
             <Route path={ROUTES.INFORMES_SINTETICOS_COMPLETADOS()} element={<ListaInformeSintetico />} />
             <Route path={ROUTES.INFORME_SINTETICO_DETALLE()} element={<InformeSinteticoDetail />} />
             <Route path={ROUTES.INFORME_SINTETICO_DETALLE_SECRETARIA()} element={<InformeSinteticoDetail />} />
             
             {/* Completar informe sintético (A veces lo hace el director de depto) */}
             <Route path={ROUTES.COMPLETAR_INFORME_SINTETICO} element={<CompletarInformeSintetico />} />
        </Route>


        {/* E. Rutas Exclusivas SECRETARÍA ACADÉMICA */}
        <Route element={<ProtectedRoute allowedRoles={['secretaria', 'admin']} />}>
             {/* Creación de Formularios Base */}
             <Route path={ROUTES.INFORME_CATEDRA_BASE_NUEVO} element={<InformeCatedraBaseForm />} />
             <Route path={ROUTES.ENCUESTA_BASE_NUEVA} element={<EncuestaBaseForm />} />
             <Route path={ROUTES.INFORME_SINTETICO_BASE_NUEVO} element={<InformeSinteticoBaseForm />} />
             
             {/* Configuración Global */}
             <Route path={ROUTES.ASIGNAR_MATERIA_INFORME} element={<AsignarFormularios />} />
             <Route path={ROUTES.DEFINIR_FECHAS} element={<DefinirFechas />} />
        </Route>

      </Route>
      
      {/* 3. RUTA 404 (Fallback) */}
      <Route path="*" element={
        <div className="text-center mt-5">
            <h2>404 - Página no encontrada</h2>
            <p>La ruta solicitada no existe.</p>
        </div>
      } />

    </Routes>
  );
}

export default App;