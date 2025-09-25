//import "./docentes.css";
import type { Docente } from "../../types/types";
import ListaMaterias from "../materia/materias";

type Props = {
  docente: Docente | undefined;
};


export default function DetalleDocente ({ docente }: Props){
  if (!docente) {
    return <p>Docente no existe</p>;
  }

  return(
    <div className="DetalleDocente">
      <h1>{docente.nombre} {docente.apellido}</h1>
      {/* Le pasamos SOLO las materias al componente ListaMaterias */}
      <ListaMaterias materias={docente.materias} />
        
    </div>
  );
}