import type { Materia } from "../../types/types";

type Props = {
  materias: Materia[] | undefined;
  //onSelect: (materia: Materia) => void;
};


export default function ListaMaterias ({ materias }: Props){
  if (materias?.length === 0) {
    return (
      <div className="alert alert-info text-center">
        No hay materias disponibles para este docente
      </div>
    );
  }

  return(
    <div>
      <h2 className="h5 mb-3">Materias asignadas</h2>
      <div className="list-group">
        {materias?.map((materia, i) => (
          <div key={materia.id} className="col-12 mb-3">
            <div className="card">
              <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted me-3">{i + 1}.</span>
                <span className="fw-bold">{materia.nombre}</span>
                <span className="text-dark"> – {materia.matricula}</span>
              </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}