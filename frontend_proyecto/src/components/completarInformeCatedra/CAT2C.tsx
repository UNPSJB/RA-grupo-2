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
}

interface Props {
  onTotalPreguntas?: (id: number, cantidad: number) => void;
  onRespuesta: (pregunta_id: number, texto: string) => void;
}

export default function Categoria2CInforme({ onTotalPreguntas, onRespuesta }: Props) {
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [categoria, setCategoria] = useState<Categoria>();
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [reflexion, setReflexion] = useState<Pregunta | null>(null);

  useEffect(() => {
    const codigoDeseado = "2.C";
    const informeId = 3; // ID del informe base

    fetch(`http://localhost:8000/informes_catedra/${informeId}/categorias`)
      .then((res) => res.json())
      .then((todas: Categoria[]) => {
        const filtrada = todas.find((c) => c.cod === codigoDeseado);
        if (filtrada) setCategoria(filtrada);
      })
      .catch((err) => console.error("Error al obtener categorías:", err));
  }, []);

  useEffect(() => {
    if (categoria) {
      fetch(`http://localhost:8000/categorias/${categoria.id}/preguntas`)
        .then((res) => res.json())
        .then((data: Pregunta[]) => {
          const reflexion = data.find((p) =>
            p.enunciado.toLowerCase().includes("resumen de la reflexión")
          );
          setReflexion(reflexion || null);

          const sinReflexion = reflexion ? data.filter((p) => p.id !== reflexion.id) : data;
          setPreguntas(sinReflexion);

          const inicial: Record<number, string> = {};
          data.forEach((p) => (inicial[p.id] = ""));
          setRespuestas(inicial);

          onTotalPreguntas?.(categoria.id, data.length);
        })
        .catch((err) => console.error("Error al obtener preguntas:", err));
    }
  }, [categoria, onTotalPreguntas]);

  const actualizarRespuestaTexto = (preguntaId: number, texto: string) => {
    setRespuestas((prev) => {
      const updated = { ...prev, [preguntaId]: texto };
      onRespuesta(preguntaId, texto);
      return updated;
    });
  };

  if (!categoria) return <div>Cargando categoría...</div>;

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
        <strong>
          {categoria.cod} - {categoria.texto}
        </strong>
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
            onChange={(e) => actualizarRespuestaTexto(reflexion.id, e.target.value)}
          ></textarea>
        </div>
      )}
    </div>
  );
}

