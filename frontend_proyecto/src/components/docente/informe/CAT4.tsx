import { useEffect, useState, Fragment } from "react";

type RespuestaValor = { opcion_id: number | null; texto_respuesta: string | null; };
interface Opcion { id: number; contenido: string; }
interface Pregunta { id: number; enunciado: string; categoria_id: number; opciones?: Opcion[]; }
interface Categoria { id: number; cod: string; texto: string; preguntas: Pregunta[]; }

interface Props {
  categoria: Categoria;
  manejarCambio: (preguntaId: number, valor: RespuestaValor) => void;
  respuestas: Record<number, RespuestaValor>;
}

const normalizarString = (texto: string): string => {
  if (!texto) return ""; 
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 
};

const ROLES = [
  { key: "jtp", texto: "JTP" },
  { key: "auxiliar de primera", texto: "Auxiliar de Primera" },
  { key: "auxiliar de segunda", texto: "Auxiliar de Segunda" },
];

export default function Categoria4Informe({ categoria, manejarCambio, respuestas}: Props) {
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);

  const autoExpand = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  useEffect(() => {
    if (!categoria) return;
    setPreguntas(categoria.preguntas);
  }, [categoria]);

  const actualizarRespuesta = (
    preguntaId: number,
    valor: string | number,
    tipo: "cerrada" | "abierta"
  ) => {
    const nuevoValor: RespuestaValor = {
      opcion_id: tipo === "cerrada" ? Number(valor) || null : null,
      texto_respuesta: tipo === "abierta" ? String(valor) : null,
    };
    manejarCambio(preguntaId, nuevoValor);
  };

  const findPreguntaId = (
    rolKey: string,
    tipo: "calificacion" | "justificacion"
  ): number => {
    const searchTerm = tipo === "calificacion" ? "calificacion" : "justificacion"; 
    const expectedEnunciado = normalizarString(`${searchTerm} - ${rolKey}`);
    const p = preguntas.find(
      (p) => normalizarString(p.enunciado) === expectedEnunciado
    );
    return p ? p.id : 0;
  };

  return (
    <Fragment>
      <div className="table-responsive">
        <table className="table table-bordered m-0 align-middle">
          <thead className="table-light text-center">
            <tr>
              <th style={{ width: "20%" }}>JTP/Auxiliares</th>
              <th style={{ width: "25%" }}>Calificación</th>
              <th style={{ width: "55%" }}>Justificación de la calificación</th>
            </tr>
          </thead>
          <tbody>
            {ROLES.map((rol) => {
              const calificacionPId = findPreguntaId(rol.key, "calificacion");
              const justificacionPId = findPreguntaId(rol.key, "justificacion");
              const nombrePId =
                preguntas.find((p) => normalizarString(p.enunciado) === normalizarString(`Nombre - ${rol.texto}`))
                  ?.id || 0;

              const preguntaCalificacion = preguntas.find(
                (p) => p.id === calificacionPId
              );
              const opciones = preguntaCalificacion?.opciones || [];

              return (
                <tr key={rol.key}>
                  <td className="p-1">
                    <textarea
                      className="form-control border-0"
                      rows={1}
                      style={{ background: "transparent", resize: 'none', width: '100%'}}
                      placeholder={`${rol.texto}`}
                      value={respuestas[nombrePId]?.texto_respuesta || ""}
                      onChange={(e) => {
                        actualizarRespuesta(nombrePId, e.target.value, "abierta");
                        autoExpand(e);
                      }}
                      onInput={autoExpand}
                      disabled={!nombrePId}
                    />
                  </td>
                  <td>
                    <select
                      className="form-select border-0"
                      style={{
                        borderBottom: '1px solid #9ea5abff'
                      }}
                      value={respuestas[calificacionPId]?.opcion_id || ""}
                      onChange={(e) =>
                        actualizarRespuesta(
                          calificacionPId,
                          e.target.value,
                          "cerrada"
                        )
                      }
                      disabled={!calificacionPId}
                    >
                      <option value="">Seleccionar</option>
                      {opciones.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.contenido}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <textarea
                      className="form-control border-0"
                      rows={2}
                      value={respuestas[justificacionPId]?.texto_respuesta || ""}
                      onChange={(e) => {
                        actualizarRespuesta(
                          justificacionPId,
                          e.target.value,
                          "abierta"
                        );
                        autoExpand(e);
                      }}
                      onInput={autoExpand}
                      disabled={!justificacionPId}
                      style={{ resize: "none"}}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Fragment>
  );
}