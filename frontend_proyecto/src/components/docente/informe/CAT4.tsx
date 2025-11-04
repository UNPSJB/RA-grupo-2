import { useEffect, useState } from "react";

interface Opcion {
  id: number;
  contenido: string;
}

interface Pregunta {
  id: number;
  enunciado: string;
  categoria_id: number;
  opciones?: Opcion[];
}

interface Categoria {
  id: number;
  cod: string;
  texto: string;
  preguntas: Pregunta[];
}

type RespuestaValor = {
  opcion_id: number | null;
  texto_respuesta: string | null;
};

interface Props {
  categoria: Categoria;
  manejarCambio: (preguntaId: number, valor: RespuestaValor) => void;
  autoExpand: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const normalizarString = (texto: string): string => {
  if (!texto) return ""; 
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

const ROLES = [
  { key: "jtp", texto: "JTP" },
  { key: "auxiliar de primera", texto: "Auxiliar de Primera" },
  { key: "auxiliar de segunda", texto: "Auxiliar de Segunda" },
];

export default function Categoria4Informe({ categoria, manejarCambio, autoExpand}: Props) {
  const [respuestas, setRespuestas] = useState<Record<number, RespuestaValor>>({});
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);

  useEffect(() => {
    if (!categoria) return;
    setPreguntas(categoria.preguntas);

    const inicial: Record<number, RespuestaValor> = {};
    categoria.preguntas.forEach((p) => {
      inicial[p.id] = { opcion_id: null, texto_respuesta: null };
    });
    setRespuestas(inicial);
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

    setRespuestas((prev) => ({
      ...prev,
      [preguntaId]: nuevoValor,
    }));

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
    <div className="card-body p-0">
      <div className="table-responsive">
          <table 
            className="table table-bordered m-0 align-middle" 
            style={{ 
              borderRadius: '8px', 
              overflow: 'hidden', 
              borderColor: '#dee2e6'}}>
          <thead className="table-light text-center">
            <tr>
              <th style={{ width: "30%" }}>JTP/Auxiliares</th>
              <th style={{ width: "25%" }}>Calificación</th>
              <th style={{ width: "55%" }}>Justificación de la calificación</th>
            </tr>
          </thead>
          <tbody>
            {ROLES.map((rol) => {
              const calificacionPId = findPreguntaId(rol.key, "calificacion");
              const justificacionPId = findPreguntaId(rol.key, "justificacion");
              const nombrePId =
                preguntas.find((p) => p.enunciado === `Nombre - ${rol.texto}`)
                  ?.id || 0;

              const preguntaCalificacion = preguntas.find(
                (p) => p.id === calificacionPId
              );
              const opciones = preguntaCalificacion?.opciones || [];

              return (
                <tr key={rol.key}>
                  <td className="p-1">
                    <textarea
                      className="form-control border-0 text-center"
                      rows={2}
                      style={{ background: "transparent", resize: "none", width: "100%"}}
                      placeholder={`Nombre del ${rol.texto}`}
                      value={respuestas[nombrePId]?.texto_respuesta || ""}
                      onChange={(e) => {
                        actualizarRespuesta(nombrePId, e.target.value, "abierta")
                        autoExpand(e);
                      }}
                      onInput={autoExpand}
                      disabled={!nombrePId}
                    />
                  </td>
                  <td>
                    <select
                      className="form-select"
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
                      className="form-control"
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
                      style={{ resize: "none"}}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
