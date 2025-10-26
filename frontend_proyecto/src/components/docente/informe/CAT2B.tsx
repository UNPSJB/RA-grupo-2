import { useEffect, useState } from "react";

type RespuestaValor = {
  opcion_id: number | null;
  texto_respuesta: string | null;
};

interface Pregunta {
  id: number;
  enunciado: string;
  categoria_id?: number;
}

interface Categoria {
  id: number;
  cod: string;
  texto: string;
  preguntas: Pregunta[];
}

interface Props {
  categoria: Categoria;
  manejarCambio: (preguntaId: number, valor: RespuestaValor) => void;
}

export default function Categoria2BInforme({ categoria, manejarCambio }: Props) {
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [observacion, setObservacion] = useState<Pregunta | null>(null);
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);

  useEffect(() => {
    if (!categoria) return;

    const obs = categoria.preguntas.find((p) =>
      p.enunciado.toLowerCase().includes("observaciones")
    );

    setObservacion(obs || null);

    const sinObs = obs
      ? categoria.preguntas.filter((p) => p.id !== obs.id)
      : categoria.preguntas;
    setPreguntas(sinObs);

    const inicial: Record<number, string> = {};
    categoria.preguntas.forEach((p) => (inicial[p.id] = ""));
    setRespuestas(inicial);
  }, [categoria]);

  const actualizarRespuestaTexto = (preguntaId: number, texto: string) => {
    setRespuestas((prev) => ({
      ...prev,
      [preguntaId]: texto,
    }));

    manejarCambio(preguntaId, {
      opcion_id: null,
      texto_respuesta: texto,
    });
  };

  return (
    <div className="card mt-3">
      <div className="card-header bg-primary text-white">
        <strong>
          {categoria.cod} - {categoria.texto}
        </strong>
      </div>

      <div className="card-body p-0">
        <table className="table table-bordered m-0">
          <thead className="table-light">
            <tr>
              <th style={{ width: "70%" }}>Grupo-Denominación</th>
              <th style={{ width: "30%" }}>Valor</th>
            </tr>
          </thead>
          <tbody>
            {preguntas.map((p) => (
              <tr key={p.id}>
                <td>{p.enunciado}</td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={respuestas[p.id] || ""}
                    onChange={(e) =>
                      actualizarRespuestaTexto(p.id, e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {observacion && (
        <div className="card-footer bg-light">
          <label className="form-label fw-bold">
            {observacion.enunciado}
          </label>
          <textarea
            className="form-control"
            rows={3}
            value={respuestas[observacion.id] || ""}
            onChange={(e) =>
              actualizarRespuestaTexto(observacion.id, e.target.value)
            }
          ></textarea>
        </div>
      )}
    </div>
  );
}
