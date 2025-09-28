import { useParams, useLocation } from "react-router-dom"

export default function DetalleCarrera(){
    const { id } = useParams();
    const location = useLocation();
    const nombreCarrera = location.state?.nombre || "Carrera ";

    return (
        <div className="container py-4">
            <div className="card">
                <div className="card-header bg-primary text-white">
                    <h1 className="h4 mb-0">Completar Informe Sintético</h1>
                </div>
                <div className="card-body">
                    <div className="alert alert-info">
                        <strong>Carrera {id}: </strong>{nombreCarrera}
                    </div>
                    <p>(Acá va el formulario para completar el informe sintético)</p>
                </div>
            </div>
        </div>
     );
}