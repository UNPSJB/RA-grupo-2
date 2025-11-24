import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ROUTES from "../paths";

const ActionCard = ({ title, to }: { title: string, to: string }) => (
    <div className="col-md-4 mb-4">
        <Link to={to} className="card card-hover-effect h-100 text-decoration-none">
            <div className="card-body">
                <h5 className="card-title text-primary">{title}</h5>
            </div>
        </Link>
    </div>
);

const dashboardLinks = (role: string) => {
    const baseLinks = [];

    if (['alumno', 'admin', 'secretaria'].includes(role)) {
        baseLinks.push(
            { title: "Encuestas Disponibles", to: ROUTES.ENCUESTAS_DISPONIBLES },
            { title: "Encuestas Completadas", to: ROUTES.ENCUESTAS_COMPLETADAS }
        );
    }

    if (['docente', 'admin', 'secretaria'].includes(role)) {
        baseLinks.push(
            { title: "Informes Pendientes", to: ROUTES.INFORMES_CATEDRA_PENDIENTES },
            { title: "Informes Completados", to: ROUTES.INFORMES_CATEDRA_COMPLETADOS }
        );
    }

    if (['departamento', 'admin', 'secretaria'].includes(role)) {
        baseLinks.push(
            { title: "Informes Sintéticos Pendientes", to: ROUTES.CARRERAS_DPTO(1) },
            { title: "Informes Sintéticos Completados", to: ROUTES.INFORMES_SINTETICOS_COMPLETADOS(1) },
            { title: "Informes de Cátedra", to: ROUTES.INFORMES_CATEDRA }
        );
    }
    
    if (['secretaria', 'admin'].includes(role)) {
        baseLinks.push(
            { title: "Crear Base", to: ROUTES.INFORME_CATEDRA_BASE_NUEVO },
            { title: "Asignar Formularios", to: ROUTES.ASIGNAR_MATERIA_INFORME }
        );
    }
    
    return baseLinks;
};

export default function UserDashboard() {
    const { currentUser } = useAuth();
    const userRole = currentUser?.role_name || 'Invitado';
    const links = dashboardLinks(userRole);

    return (
        <div className="container mt-5">
            <div className="row">
                {links.map((link, index) => (
                    <ActionCard key={index} {...link} />
                ))}
            </div>

            {links.length === 0 && (
                <div className="alert alert-info mt-4">
                    No hay opciones de menú asignadas a tu rol ({userRole}) en este momento.
                </div>
            )}
        </div>
    );
}