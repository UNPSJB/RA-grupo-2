import { useEffect, useState } from "react";

type RespuestaValor = {
  opcion_id: number | null;
  texto_respuesta: string | null;
};

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
  manejarCambio: (preguntaId: number, valor: RespuestaValor) => void;
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

    const inicial: Record<number, string> = {};
    categoria.preguntas.forEach((p) => {
      inicial[p.id] = "";
    });
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

  const getPregunta = (texto: string) =>
    preguntas.find((p) => p.enunciado.toLowerCase().includes(texto.toLowerCase()));

  const pEnsPos = getPregunta("Aspectos positivos: Proceso Enseñanza");
  const pAprPos = getPregunta("Aspectos positivos: Proceso de aprendizaje");
  const pEnsObs = getPregunta("Obstáculos: Proceso Enseñanza");
  const pAprObs = getPregunta("Obstáculos: Proceso de aprendizaje");
  const pEstrategias = getPregunta("Estrategias a implementar");

  const autoExpand = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  return (
    <div className="card-body p-0">
      <div className="mb-4 p-4 border rounded bg-light">
        <h6 className="fw-bold mb-3 text-dark border-bottom pb-2">Aspectos positivos</h6>
        
        <div className="mb-3">
          <label className="form-label fw-semibold text-dark mb-2">
            Proceso enseñanza
          </label>
          <textarea
            className="form-control"
            rows={3}
            value={respuestas[pEnsPos?.id || 0] || ""}
            onChange={(e) =>
              pEnsPos && actualizarRespuestaTexto(pEnsPos.id, e.target.value)
            }
            onInput={autoExpand}
            disabled={!pEnsPos}
            style={{ resize: 'none', minHeight: '80px' }}
          />
        </div>

        <div>
          <label className="form-label fw-semibold text-dark mb-2">
            Proceso de aprendizaje
          </label>
          <textarea
            className="form-control"
            rows={3}
            value={respuestas[pAprPos?.id || 0] || ""}
            onChange={(e) =>
              pAprPos && actualizarRespuestaTexto(pAprPos.id, e.target.value)
            }
            onInput={autoExpand}
            disabled={!pAprPos}
            style={{ resize: 'none', minHeight: '80px' }}
          />
        </div>
      </div>

      <div className="mb-4 p-4 border rounded bg-light">
        <h6 className="fw-bold mb-3 text-dark border-bottom pb-2">Obstáculos</h6>
        
        <div className="mb-3">
          <label className="form-label fw-semibold text-dark mb-2">
            Proceso enseñanza
          </label>
          <textarea
            className="form-control"
            rows={3}
            value={respuestas[pEnsObs?.id || 0] || ""}
            onChange={(e) =>
              pEnsObs && actualizarRespuestaTexto(pEnsObs.id, e.target.value)
            }
            onInput={autoExpand}
            disabled={!pEnsObs}
            style={{ resize: 'none', minHeight: '80px' }}
          />
        </div>

        <div>
          <label className="form-label fw-semibold text-dark mb-2">
            Proceso de aprendizaje
          </label>
          <textarea
            className="form-control"
            rows={3}
            value={respuestas[pAprObs?.id || 0] || ""}
            onChange={(e) =>
              pAprObs && actualizarRespuestaTexto(pAprObs.id, e.target.value)
            }
            onInput={autoExpand}
            disabled={!pAprObs}
            style={{ resize: 'none', minHeight: '80px' }}
          />
        </div>
      </div>

      <div className="mb-4 p-4 border rounded bg-light">
        <h6 className="fw-bold mb-3 text-dark border-bottom pb-2">Estrategias a implementar</h6>
        <textarea
          className="form-control"
          rows={3}
          value={respuestas[pEstrategias?.id || 0] || ""}
          onChange={(e) =>
            pEstrategias && actualizarRespuestaTexto(pEstrategias.id, e.target.value)
          }
          onInput={autoExpand}
          disabled={!pEstrategias}
          style={{ resize: 'none', minHeight: '80px' }}
        />
      </div>

      {reflexion && (
        <div className="mb-4 p-4 border rounded bg-light">
          <h6 className="fw-bold mb-3 text-dark border-bottom pb-2">{reflexion.enunciado}</h6>
          <textarea
            className="form-control"
            rows={4}
            value={respuestas[reflexion.id] || ""}
            onChange={(e) =>
              actualizarRespuestaTexto(reflexion.id, e.target.value)
            }
            onInput={autoExpand}
            style={{ resize: 'none', minHeight: '100px' }}
          />
        </div>
      )}
    </div>
  );
}