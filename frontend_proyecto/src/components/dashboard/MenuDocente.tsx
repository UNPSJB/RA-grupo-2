import { getRoleLinks } from "../../config/navigationParams";
import { ActionCard } from "./ActionCard";

export default function MenuDocente() {
    const links = getRoleLinks('docente');

    return (
        <div className="row g-4 justify-content-center">
            {links.map((link, index) => (
                <div className="col-12 col-md-6 col-xl-4 mb-4" key={index}>
                    <ActionCard {...link} index={index} />
                </div>
            ))}
        </div>
    );
}