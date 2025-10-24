import { useEffect, useState } from "react";

interface Pregunta {
  id: number;
  enunciado: string;
  categoria_id: number;
}

interface Categoria {
  id: number;
  cod: string;
  texto: string;
  preguntas: Pregunta[];
}

interface Props {
  categoria: Categoria;
  manejarCambio: (preguntaId: number, texto: string) => void;
}

export default function Categoria2CInforme({ categoria, manejarCambio }: Props) {
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [reflexion, setReflexion] = useState<Pregunta | null>(null);
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!categoria) return;

    const reflexionEncontrada = categoria.preguntas.find((p) =>
      p.enunciado.toLowerCase().includes("resumen de la reflexión")
    );

    setReflexion(reflexionEncontrada || null);

    const sinReflexion = reflexionEncontrada
      ? categoria.preguntas.filter((p) => p.id !== reflexionEncontrada.id)
      : categoria.preguntas;

    setPreguntas(sinReflexion);

    // Inicializar respuestas
    const inicial: Record<number, string> = {};
    categoria.preguntas.forEach((p) => {
      inicial[p.id] = "";
    });
    setRespuestas(inicial);
  }, [categoria]);

  const actualizarRespuestaTexto = (preguntaId: number, texto: string) => {
    setRespuestas((prev) => {
      const updated = { ...prev, [preguntaId]: texto };
      manejarCambio(preguntaId, texto);
      return updated;
    });
  };

  const getPregunta = (texto: string) =>
    preguntas.find((p) => p.enunciado.toLowerCase().includes(texto.toLowerCase()));

  const pEnsPos = getPregunta("Aspectos positivos: Proceso Enseñanza");
  const pAprPos = getPregunta("Aspectos positivos: Proceso de aprendizaje");
  const pEnsObs = getPregunta("Obstáculos: Proceso Enseñanza");
  const pAprObs = getPregunta("Obstáculos: Proceso de aprendizaje");
  const pEstrategias = getPregunta("Estrategias a implementar");

  return (
    <div className="card mt-3">
      <div className="card-header bg-primary text-white">
        <strong>{categoria.cod} - {categoria.texto}</strong>
      </div>

      <div className="card-body p-0">
        <table className="table table-bordered m-0 align-middle">
          <thead className="table-light text-center">
            <tr>
              <th colSpan={2}>Aspectos positivos</th>
              <th colSpan={2}>Obstáculos</th>
              <th rowSpan={2} style={{ verticalAlign: "middle" }}>
                Estrategias a implementar
              </th>
            </tr>
            <tr>
              <th>Proceso enseñanza</th>
              <th>Proceso de aprendizaje</th>
              <th>Proceso enseñanza</th>
              <th>Proceso de aprendizaje</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <textarea
                  className="form-control"
                  rows={3}
                  value={respuestas[pEnsPos?.id || 0] || ""}
                  onChange={(e) =>
                    pEnsPos && actualizarRespuestaTexto(pEnsPos.id, e.target.value)
                  }
                />
              </td>
              <td>
                <textarea
                  className="form-control"
                  rows={3}
                  value={respuestas[pAprPos?.id || 0] || ""}
                  onChange={(e) =>
                    pAprPos && actualizarRespuestaTexto(pAprPos.id, e.target.value)
                  }
                />
              </td>
              <td>
                <textarea
                  className="form-control"
                  rows={3}
                  value={respuestas[pEnsObs?.id || 0] || ""}
                  onChange={(e) =>
                    pEnsObs && actualizarRespuestaTexto(pEnsObs.id, e.target.value)
                  }
                />
              </td>
              <td>
                <textarea
                  className="form-control"
                  rows={3}
                  value={respuestas[pAprObs?.id || 0] || ""}
                  onChange={(e) =>
                    pAprObs && actualizarRespuestaTexto(pAprObs.id, e.target.value)
                  }
                />
              </td>
              <td>
                <textarea
                  className="form-control"
                  rows={3}
                  value={respuestas[pEstrategias?.id || 0] || ""}
                  onChange={(e) =>
                    pEstrategias && actualizarRespuestaTexto(pEstrategias.id, e.target.value)
                  }
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {reflexion && (
        <div className="card-footer bg-light">
          <label className="form-label fw-bold">{reflexion.enunciado}</label>
          <textarea
            className="form-control"
            rows={4}
            value={respuestas[reflexion.id] || ""}
            onChange={(e) =>
              actualizarRespuestaTexto(reflexion.id, e.target.value)
            }
          />
        </div>
      )}
    </div>
  );
}
