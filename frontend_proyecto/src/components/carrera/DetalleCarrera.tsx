import { useParams, useLocation } from "react-router-dom"

export default function DetalleCarrera(){
    const { id } = useParams(); //no lo use solo pq no queria q se vea en la interfaz
    const location = useLocation();
    const nombreCarrera = location.state?.nombre || "Carrera ";

    return (
        <div>
        <h1>Completar Informe Sintético</h1>
        <p>Carrera {id}: <strong>{nombreCarrera}</strong></p>
        <p>(Acá va el formulario para completar el informe sintetico)</p>
        </div>
     );
}