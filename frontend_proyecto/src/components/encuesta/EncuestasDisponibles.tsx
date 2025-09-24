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
    <ul>
      {encuestas.map((e, i) => (
        <li 
            key={i}
            style={{
                border: "1px solid #5e5656ff",
                padding: "10px",
                marginBottom: "8px",
                borderRadius: "6px",
                cursor: "pointer",
            }}
        >
          <Link to={`/encuestas/${i}`} style={{ textDecoration: "none", color: "inherit" }}>
            <strong>{e.materia}</strong> — {e.encuesta}
          </Link>
        </li>
      ))}
    </ul>
  );
}
