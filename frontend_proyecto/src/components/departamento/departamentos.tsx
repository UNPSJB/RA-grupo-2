import "./departamentos.css";
import ListaCarreras from "../carrera/carreras";
import type { Departamento, Carrera } from "../../types/types";

type Props = {
  departamento: Departamento;
  carreras: Carrera[];
};

function DetalleDepartamento({ departamento, carreras }: Props) {
  return (
    <div className="departamento-container">
      <div className="departamento-header">
        <h1>Departamento de {departamento.nombre}</h1>
        <h2>Carreras:</h2>
      </div>
      <ListaCarreras carreras={carreras} />
    </div>
  );
}

export default DetalleDepartamento;