import "./materias.css";
import type { Materia } from "../../types/types";

type Props = {
  materias: Materia[] | undefined;
  //onSelect: (materia: Materia) => void;
};


export default function ListaMaterias ({ materias }: Props){
  if (materias?.length === 0) {
    return <p>No hay materias disponibles</p>;
  }

  return(
    <div className="MateriaList">
      <h1>Materias</h1>
        <ul>
        {materias?.map(materia =>

          <li key={materia.id}>
           <p><strong>Nombre:</strong> {materia.nombre}</p>
            <p><strong>Matrícula:</strong> {materia.matricula}</p>
          </li>
        )}
        </ul>
    </div>
  );
}