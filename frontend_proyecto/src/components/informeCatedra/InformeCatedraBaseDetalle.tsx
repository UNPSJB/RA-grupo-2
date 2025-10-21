import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function InformeCatedraBaseDetalle() {
  const { id } = useParams();
  const [informe, setInforme] = useState<any>(null);

  useEffect(() => {
    fetch(`http://localhost:8000/informes_catedra/${id}`)
      .then((res) => res.json())
      .then(setInforme);
  }, [id]);

  if (!informe) return <p>Cargando...</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h1>{informe.titulo}</h1>

      <h3>Materias:</h3>
      <ul>
        {informe.materias?.map((m: any) => (
          <li key={m.id}>Materia #{m.id}</li>
        ))}
      </ul>

      <h3>Categorías:</h3>
      <ul>
        {informe.categorias?.map((c: any) => (
          <li key={c.cod}>
            <strong>{c.cod}</strong> - {c.texto}{" "}
            {c.encuesta_id && <em>(Encuesta #{c.encuesta_id})</em>}
          </li>
        ))}
      </ul>
    </div>
  );
}
