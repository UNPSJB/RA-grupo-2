import { Link } from "react-router-dom";

type EncuestaDisponible = {
  materia: string;
  encuesta: string;
};

type Props = {
  encuestas: EncuestaDisponible[];
};

export default function EncuestasDisponibles({ encuestas }: Props) {
  if (encuestas.length === 0) {
    return <p>No hay encuestas disponibles</p>;
  }

  return (
    <ul className="list-group">
      {encuestas.map((e, i) => (
        <li key={i} className="list-group-item">
          <Link 
            to={`/encuestas/${i}`} 
            className="text-decoration-none text-dark d-block"
          >
            <strong>{e.materia}</strong> — {e.encuesta}
          </Link>
        </li>
      ))}
    </ul>
  );
}
