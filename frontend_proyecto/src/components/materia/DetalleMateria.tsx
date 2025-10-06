import { useParams, useLocation } from "react-router-dom"

export default function DetalleMateria(){
    const { id } = useParams();
    const location = useLocation();
    const nombreMateria = location.state?.nombre || "Materia ";

    return (
        <div className="container py-4">
            <div className="card">
                <div className="card-header bg-primary text-white">
                    <h1 className="h4 mb-0"><strong>{id}: </strong>{nombreMateria}</h1>
                </div>
                <div className="card-body">
                    <div className="alert alert-info">
                    </div>
                    <p>Proximamente...</p>
                </div>
            </div>
        </div>
     );
}