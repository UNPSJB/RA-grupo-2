import { useState } from "react";
import InformeCatedraCompletadoFuncion from "./InformeCatedraCompletadoFuncion";

export default function PruebaFuncionalidad() {
  const [mostrar, setMostrar] = useState(false);
  const [docenteId, setDocenteId] = useState<number>(1);
  const [materiaId, setMateriaId] = useState<number>(2);
  const [informeId, setInformeId] = useState<number>(3);

  const handleMostrar = () => setMostrar(true);

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Probador de Informe de Cátedra</h1>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          Docente ID:
          <input
            type="number"
            value={docenteId}
            onChange={(e) => setDocenteId(Number(e.target.value))}
            style={{ marginLeft: "0.5rem", width: "80px" }}
          />
        </label>

        <label style={{ marginLeft: "1rem" }}>
          Materia ID:
          <input
            type="number"
            value={materiaId}
            onChange={(e) => setMateriaId(Number(e.target.value))}
            style={{ marginLeft: "0.5rem", width: "80px" }}
          />
        </label>

        <label style={{ marginLeft: "1rem" }}>
          Informe ID:
          <input
            type="number"
            value={informeId}
            onChange={(e) => setInformeId(Number(e.target.value))}
            style={{ marginLeft: "0.5rem", width: "80px" }}
          />
        </label>

        <button
          onClick={handleMostrar}
          style={{ marginLeft: "1rem", padding: "0.3rem 1rem" }}
        >
          Ver Informe
        </button>
      </div>

      {mostrar && (
        <InformeCatedraCompletadoFuncion
          docenteId={docenteId}
          materiaId={materiaId}
          informeId={informeId}
        />
      )}
    </div>
  );
}
    