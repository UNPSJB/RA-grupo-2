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

interface OpcionPorcentaje {
  opcion_id: string;
  porcentaje: number;
}

interface DatosEstadisticosPregunta {
  id_pregunta: string;
  datos: OpcionPorcentaje[];
}

interface DatosEstadisticosCategoria {
  categoria_cod: string;
  categoria_texto: string;
  promedio_categoria: OpcionPorcentaje[];
  preguntas: DatosEstadisticosPregunta[];
}

interface Props {
  categoria: Categoria;
  manejarCambio: (preguntaId: number, valor: RespuestaValor) => void;
  estadisticas: DatosEstadisticosCategoria[];
  autoExpand: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export default function Categoria2BInforme({ categoria, manejarCambio, estadisticas, autoExpand }: Props) {
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [observacion, setObservacion] = useState<Pregunta | null>(null);
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [preguntasValor, setpreguntasValor] = useState<number[]>([]);

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
    setpreguntasValor([]);
  }, [categoria]);

  useEffect(() => {
    if (!estadisticas || estadisticas.length === 0) return;

    const nuevasRespuestas: Record<number, string> = { ...respuestas };
    const ids_preguntas_valor: number[] = [];

    preguntas.forEach((p) => {
      if (!p.enunciado.toLowerCase().includes("observaciones")) {
        const catEst = estadisticas.find(
          (e) =>
            p.enunciado.includes(`${e.categoria_cod}:`)
        );

        if (catEst) {
          const valor = catEst.promedio_categoria
            .map((op) => `${op.opcion_id}: ${op.porcentaje.toFixed(2)}%`)
            .join(" | ");
          nuevasRespuestas[p.id] = valor;
          ids_preguntas_valor.push(p.id);

          manejarCambio(p.id, {
            opcion_id: null,
            texto_respuesta: valor,
          });
        }
      }
    });

    setRespuestas(nuevasRespuestas);
    setpreguntasValor(ids_preguntas_valor);
  }, [estadisticas, categoria, preguntas]);

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
  <>
    <div className="card-body p-1">
      <div className="table-responsive">
        <strong>
          {categoria.cod} - {categoria.texto}
        </strong>
      </div>
      
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
                  readOnly={preguntasValor.includes(p.id)}
                  onChange={(e) =>
                    actualizarRespuestaTexto(p.id, e.target.value)
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {observacion && (
        <div className="mt-4">
          <label className="form-label fw-bold">
            {observacion.enunciado}
          </label>
          <textarea
            className="form-control"
            rows={3}
            value={respuestas[observacion.id] || ""}
            onChange={(e) => {
              actualizarRespuestaTexto(observacion.id, e.target.value);
              autoExpand(e);
            }}
            onInput={autoExpand}
            style={{ resize: 'none' }}
          ></textarea>
        </div>
      )}
    </div> 
  </>
);
}