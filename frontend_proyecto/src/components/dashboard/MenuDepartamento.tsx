import { getRoleLinks } from "../../config/navigationParams";
import { ActionCard } from "./ActionCard";
import DashboardDepartamento from "../departamento/DashboardDpto"; 
import ROUTES from "../../paths"; 

export default function MenuDepartamento() {
    const links = getRoleLinks('departamento');
    const linksFiltrados = links.filter(link => link.to !== ROUTES.DASHBOARD_DPTO);
    
    return (
        <div className="d-flex flex-column gap-5">
            <div className="row g-4 justify-content-center">
                {linksFiltrados.map((link, index) => (
                    <div className="col-12 col-md-6 col-xl-4" key={index}>
                        <ActionCard {...link} index={index} />
                    </div>
                ))}
            </div>
            <div className="animate-fade-up">
                <hr className="my-4 text-secondary opacity-25" />
                <DashboardDepartamento />
            </div>
        </div>
    );
}