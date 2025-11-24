import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ROUTES from "../paths";

// --- Modern SVG Icons ---
const Icons = {
  Document: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
      <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/>
      <path d="M3 5.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 8zm0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
    </svg>
  ),
  Form: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
      <path d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm5.5 1.5v2a1 1 0 0 0 1 1h2l-3-3z"/>
      <path d="M4.5 12a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
    </svg>
  ),
  Calendar: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
      <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
    </svg>
  ),
  Chart: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
      <path d="M0 0h1v15h15v1H0V0zm10 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zm-5 3a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 1 .5-.5zm10-6a.5.5 0 0 1 .5.5v10a.5.5 0 0 1-1 0v-10a.5.5 0 0 1 .5-.5z"/>
    </svg>
  ),
  Checklist: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
      <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/>
      <path d="M7 5.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0zM7 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 0 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0z"/>
    </svg>
  )
};

const getIcon = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes("encuesta") || t.includes("asignar")) return <Icons.Checklist />;
  if (t.includes("informe") || t.includes("catedra")) return <Icons.Document />;
  if (t.includes("fecha") || t.includes("definir")) return <Icons.Calendar />;
  if (t.includes("sintetico") || t.includes("estadistica")) return <Icons.Chart />;
  return <Icons.Form />;
};

const ActionCard = ({ title, to, index }: { title: string, to: string, index: number }) => (
  <div className="col-12 col-md-6 col-xl-4 mb-4">
    <Link to={to} className="text-decoration-none">
      <div 
        className="card-modern h-100 p-4 d-flex flex-row align-items-center gap-4 animate-fade-up"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <div 
          className="d-flex align-items-center justify-content-center rounded-4 shadow-sm"
          style={{ 
            minWidth: '64px', 
            height: '64px', 
            background: 'var(--gradient-primary)',
            color: 'white'
          }}
        >
          {getIcon(title)}
        </div>
        
        <div className="flex-grow-1">
          <h5 className="fw-bold mb-1 text-dark" style={{ fontSize: '1.05rem' }}>
            {title}
          </h5>
          <div className="d-flex align-items-center text-primary small fw-medium">
            <span>Acceder ahora</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="ms-1" viewBox="0 0 16 16" style={{transition: 'transform 0.2s'}} >
              <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
            </svg>
          </div>
        </div>

        {/* Decoración de fondo */}
        <div style={{
          position: 'absolute',
          right: -20,
          bottom: -20,
          width: '100px',
          height: '100px',
          background: 'var(--color-brand-light)',
          borderRadius: '50%',
          opacity: 0.5,
          zIndex: -1
        }} />
      </div>
    </Link>
  </div>
);

// --- Logic (Roles) ---
const dashboardLinks = (role: string) => {
  const baseLinks = [];
  if (role === 'secretaria_academica') {
    baseLinks.push(
      { title: "Crear Informe de Cátedra Base", to: ROUTES.INFORME_CATEDRA_BASE_NUEVO },
      { title: "Crear Encuesta Base", to: ROUTES.ENCUESTA_BASE_NUEVA },
      { title: "Asignar Formularios a Materias", to: ROUTES.ASIGNAR_MATERIA_INFORME },
      { title: "Definir fechas de apertura", to: ROUTES.DEFINIR_FECHAS },
      { title: "Informes Sintéticos", to: ROUTES.INFORMES_SINTETICOS }
    );
  }
  if (role === 'alumno') {
    baseLinks.push(
      { title: "Encuestas Disponibles", to: ROUTES.ENCUESTAS_DISPONIBLES },
      { title: "Encuestas Completadas", to: ROUTES.ENCUESTAS_COMPLETADAS }
    );
  }
  if (role === 'docente') {
    baseLinks.push(
      { title: "Informes Pendientes", to: ROUTES.INFORMES_CATEDRA_PENDIENTES },
      { title: "Informes Completados", to: ROUTES.INFORMES_CATEDRA_COMPLETADOS },
      { title: "Graficos Estádisticos", to: ROUTES.HOME }
    );
  }
  if (role === 'departamento') {
    baseLinks.push(
      { title: "Informes Sintéticos Pendientes", to: ROUTES.CARRERAS_DPTO},
      { title: "Informes Sintéticos Completados", to: ROUTES.INFORMES_SINTETICOS_COMPLETADOS},
      { title: "Informes de Cátedra", to: ROUTES.INFORMES_CATEDRA },
      { title: "Graficos Estádisticos", to: ROUTES.DASHBOARD_DPTO }
    );
  }
  if (role === 'admin') {
    baseLinks.push(
      { title: "Encuestas Disponibles", to: ROUTES.ENCUESTAS_DISPONIBLES },
      { title: "Encuestas Completadas", to: ROUTES.ENCUESTAS_COMPLETADAS },
      { title: "Informes Pendientes", to: ROUTES.INFORMES_CATEDRA_PENDIENTES },
      { title: "Informes Completados", to: ROUTES.INFORMES_CATEDRA_COMPLETADOS },
      { title: "Informes Sintéticos Pendientes", to: ROUTES.CARRERAS_DPTO},
      { title: "Informes Sintéticos Completados", to: ROUTES.INFORMES_SINTETICOS_COMPLETADOS},
      { title: "Informes de Cátedra", to: ROUTES.INFORMES_CATEDRA },
      { title: "Crear Informe de Cátedra Base", to: ROUTES.INFORME_CATEDRA_BASE_NUEVO },
      { title: "Crear Encuesta Base", to: ROUTES.ENCUESTA_BASE_NUEVA },
      { title: "Asignar Formularios a Materias", to: ROUTES.ASIGNAR_MATERIA_INFORME },
      { title: "Definir fechas", to: ROUTES.DEFINIR_FECHAS },
      { title: "Informes Sintéticos", to: ROUTES.INFORMES_SINTETICOS }
    );
  }
  return baseLinks;
};

export default function UserDashboard() {
  const { currentUser } = useAuth();
  const userRole = currentUser?.role_name || 'Invitado';
  const links = dashboardLinks(userRole);
  
  // Date formatting
  const today = new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const capitalizedDate = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <div className="container mt-5 pt-5 pb-5">
      
      {/* Hero Section */}
      <div className="row mb-5 animate-fade-up">
        <div className="col-lg-10 mx-auto text-center">
          <span className="badge rounded-pill px-3 py-2 mb-3 shadow-sm" style={{ background: 'var(--color-surface)', color: 'var(--color-brand-primary)', border: '1px solid var(--color-brand-light)' }}>
            {capitalizedDate}
          </span>
          <h1 className="display-5 fw-bold mb-3 text-gradient">
            Hola, {currentUser?.username}
          </h1>
          <p className="lead text-secondary mx-auto" style={{ maxWidth: '600px' }}>
            Bienvenido al <span className="fw-semibold text-dark"> Al Sistema Integral de Gestión Académica</span>. 
            Aquí puedes gestionar todas tus actividades académicas de forma centralizada.
          </p>
        </div>
      </div>

      {/* Action Grid */}
      <div className="row g-4 justify-content-center">
        {links.map((link, index) => (
          <ActionCard key={index} {...link} index={index} />
        ))}
      </div>

      {links.length === 0 && (
        <div className="row justify-content-center mt-4">
          <div className="col-md-8">
            <div className="alert glass-panel text-center border-0 py-4">
              <div className="mb-3 text-muted">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                </svg>
              </div>
              <h5 className="alert-heading fw-bold">Sin acciones disponibles</h5>
              <p className="mb-0">No hay opciones de menú asignadas a tu rol ({userRole}) en este momento.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}