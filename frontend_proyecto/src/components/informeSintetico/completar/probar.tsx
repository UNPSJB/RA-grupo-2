import { useState, useCallback } from "react";
import Pregunta2B from "./Pregunta2B";


//ESTO ES SOLO PARA PROBAR QUE FUNCIONA PREGUNTA2B

interface Respuesta {
  pregunta_id: number;
  materia_id: number;
  texto_respuesta: string;
}

export default function ProbarFuncionalidad() {
  const [respuestas, setRespuestas] = useState<Respuesta[]>([]);

  const departamentoId = 1;
  const carreraId = 1;
  const anio = 2025;
  const periodo = "PRIMER_CUATRI";

  const pregunta2B = {
    id: 1,
    enunciado: "Pregunta 2B: Resultados de encuestas",
  };

  const manejarCambioRespuestas = useCallback((respuestasPregunta: Respuesta[]) => {
    setRespuestas((prev) => {
      const otras = prev.filter(
        (r) => r.pregunta_id !== respuestasPregunta[0]?.pregunta_id
      );
      return [...otras, ...respuestasPregunta];
    });
  }, []);

  return (
    <div className="container mt-4">
      <h3>Informe de Cátedra</h3>

      <Pregunta2B
        departamentoId={departamentoId}
        carreraId={carreraId}
        pregunta={pregunta2B}
        anio={anio}
        periodo={periodo}
        manejarCambio={manejarCambioRespuestas}
      />

      <hr />

      <h5>Respuestas globales (para enviar al backend):</h5>
      <pre className="bg-light p-3 rounded border mt-3">
        {JSON.stringify(respuestas, null, 2)}
      </pre>
    </div>
  );
}
