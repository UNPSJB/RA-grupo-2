type EncuestaDisponible = {
  materia: string;
  encuesta: string;
};

type Props = {
  encuestas: EncuestaDisponible[];
  onSelect: (encuesta: EncuestaDisponible) => void;
};

export default function EncuestasDisponibles({ encuestas, onSelect}: Props) {
  if (encuestas.length === 0) {
    return <p>No hay encuestas disponibles</p>;
  }

  return (
    <ul>
      {encuestas.map((e, i) => (
        <li 
            key={i}
            onClick={() => onSelect(e)}
            style={{
                border: "1px solid #5e5656ff",
                padding: "10px",
                marginBottom: "8px",
                borderRadius: "6px",
                cursor: "pointer",
            }}
        >
          <strong>{e.materia}</strong> — {e.encuesta}
        </li>
      ))}
    </ul>
  );
}
