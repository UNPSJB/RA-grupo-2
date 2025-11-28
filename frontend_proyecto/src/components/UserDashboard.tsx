import { useAuth } from "../context/AuthContext";
import MenuAlumno from "./dashboard/MenuAlumno";
import MenuDocente from "./dashboard/MenuDocente";
import MenuDepartamento from "./dashboard/MenuDepartamento";
import MenuSecretaria from "./dashboard/MenuSecretaria";
const MenuAdmin = () => {
    return <div className="text-center">Bienvenido Administrador</div>;
};

export default function UserDashboard() {
  const { currentUser } = useAuth();
  const userRole = currentUser?.role_name || 'Invitado';

  const today = new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const capitalizedDate = today.charAt(0).toUpperCase() + today.slice(1);

  const renderMenu = () => {
    switch (userRole) {
        case 'alumno':
            return <MenuAlumno />;
        case 'docente':
            return <MenuDocente />;
        case 'departamento':
            return <MenuDepartamento />;
        case 'secretaria_academica':
            return <MenuSecretaria />;
        case 'admin':
            return <MenuAdmin />; 
        default:
            return (
                <div className="alert alert-warning text-center">
                    Rol no reconocido ({userRole}). Contacte a soporte.
                </div>
            );
    }
  };

  return (
    <div className="container mt-5 pt-5 pb-5">
      <div className="row mb-5 animate-fade-up">
        <div className="col-lg-10 mx-auto text-center">
          <span className="badge rounded-pill px-3 py-2 mb-3 shadow-sm" style={{ background: 'var(--color-surface)', color: 'var(--color-brand-primary)', border: '1px solid var(--color-brand-light)' }}>
            {capitalizedDate}
          </span>
          <h1 className="display-5 fw-bold mb-3 text-gradient">
            Hola, {currentUser?.username}
          </h1>
          <p className="lead text-secondary mx-auto" style={{ maxWidth: '600px' }}>
            Bienvenido al <span className="fw-semibold text-dark"> Sistema Integral de Gestión Académica</span>.
          </p>
        </div>
      </div>
      {renderMenu()}
      
    </div>
  );
}