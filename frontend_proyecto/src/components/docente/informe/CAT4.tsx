import { useEffect, useState, Fragment } from "react";

type RespuestaValor = { opcion_id: number | null; texto_respuesta: string | null };
interface Opcion { id: number; contenido: string; }
interface Pregunta { id: number; enunciado: string; categoria_id: number; opciones?: Opcion[]; obligatoria?: boolean; }
interface Categoria { id: number; cod: string; texto: string; preguntas: Pregunta[]; }

interface Props {
  categoria: Categoria;
  manejarCambio: (preguntaId: number, valor: RespuestaValor) => void;
  respuestas: Record<number, RespuestaValor>;
  nombresFuncion?: { JTP: string | null; aux1: string | null; aux2: string | null };
  isReadOnly?: boolean;
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

export default function Categoria4Informe({
  categoria,
  manejarCambio,
  respuestas,
  nombresFuncion,
  isReadOnly = false,
}: Props) {
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);

  const autoExpand = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  };

  useEffect(() => {
    if (categoria) setPreguntas(categoria.preguntas);
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

  const findPregunta = (
    rolKey: string,
    tipo: "calificacion" | "justificacion"
  ): Pregunta | undefined => {
    const searchTerm = tipo === "calificacion" ? "calificacion" : "justificacion";
    const expectedEnunciado = normalizarString(`${searchTerm} - ${rolKey}`);
    return preguntas.find(
      (p) => normalizarString(p.enunciado) === expectedEnunciado
    );
  };

  const getOpcionTexto = (preguntaId: number): string => {
    const opcionId = respuestas[preguntaId]?.opcion_id;
    if (!opcionId) return "—";
    const pregunta = preguntas.find((p) => p.id === preguntaId);
    const opcion = pregunta?.opciones?.find((o) => o.id === opcionId);
    return opcion?.contenido || "—";
  };

  const getNombreFuncion = (rolKey: string): string => {
    if (!nombresFuncion) return "";
    if (rolKey === "jtp") return nombresFuncion.JTP ? nombresFuncion.JTP : "";
    if (rolKey === "auxiliar de primera") return nombresFuncion.aux1 ? nombresFuncion.aux1 : "";
    if (rolKey === "auxiliar de segunda") return nombresFuncion.aux2 ? nombresFuncion.aux2 : "";
    return "";
  };

  const rolesVisibles = isReadOnly
    ? ROLES.filter((rol) => getNombreFuncion(rol.key).trim())
    : ROLES;

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
            {rolesVisibles.map((rol) => {
              const pCalif = findPregunta(rol.key, "calificacion");
              const pJust = findPregunta(rol.key, "justificacion");
              const calificacionPId = pCalif ? pCalif.id : 0;
              const justificacionPId = pJust ? pJust.id : 0;

              const opciones = pCalif?.opciones || [];
              const nombre = getNombreFuncion(rol.key);
              const habilitado = !!nombre.trim();

              return (
                <tr key={rol.key} style={{ opacity: habilitado ? 1 : 0.6 }}>
                  <td className="p-2">
                    <strong>{rol.texto}</strong>
                    {nombre ? (
                      <span className="text-muted">{" - " + nombre}</span>
                    ) : (
                      <span className="text-muted">{" *complete el nombre en Datos Generales para calificar"}</span>
                    )}
                  </td>

                  <td>
                    {isReadOnly ? (
                      <p className="form-control-plaintext px-2">
                        {getOpcionTexto(calificacionPId)}
                      </p>
                    ) : (
                      <div className="d-flex align-items-center">
                        <select
                          className="form-select border-0"
                          style={{ borderBottom: "1px solid #9ea5abff" }}
                          value={respuestas[calificacionPId]?.opcion_id || ""}
                          onChange={(e) =>
                            actualizarRespuesta(
                              calificacionPId,
                              e.target.value,
                              "cerrada"
                            )
                          }
                          disabled={!habilitado || !calificacionPId}
                        >
                          <option value="">Seleccionar</option>
                          {opciones.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.contenido}
                            </option>
                          ))}
                        </select>
                        {pCalif?.obligatoria && habilitado && <span className="text-danger ms-1">*</span>}
                      </div>
                    )}
                  </td>

                  <td>
                    {isReadOnly ? (
                      <p
                        className="form-control-plaintext px-2"
                        style={{ whiteSpace: "pre-wrap" }}
                      >
                        {respuestas[justificacionPId]?.texto_respuesta || "—"}
                      </p>
                    ) : (
                      <div className="d-flex align-items-start">
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
                          disabled={!habilitado || !justificacionPId}
                          style={{ resize: "none" }}
                        />
                        {pJust?.obligatoria && habilitado && <span className="text-danger ms-1">*</span>}
                      </div>
                    )}
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