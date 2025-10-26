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

const ROLES = [
  { key: "jtp", texto: "JTP" },
  { key: "auxiliar de primera", texto: "Auxiliar de Primera" },
  { key: "auxiliar de segunda", texto: "Auxiliar de Segunda" },
];

const CALIFICACIONES = [
  { valor: "", texto: "Seleccionar" },
  { valor: "E", texto: "E (Excelente)" },
  { valor: "MB", texto: "MB (Muy bueno)" },
  { valor: "B", texto: "B (Bueno)" },
  { valor: "R", texto: "R (Regular)" },
  { valor: "I", texto: "I (Insuficiente)" },
];

export default function Categoria4Informe({ categoria, manejarCambio }: Props) {
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);

  useEffect(() => {
    if (!categoria) return;
    setPreguntas(categoria.preguntas);
    const inicial: Record<number, string> = {};
    categoria.preguntas.forEach((p) => {
      inicial[p.id] = "";
    });
    setRespuestas(inicial);
  }, [categoria]);

  const actualizarRespuesta = (preguntaId: number, texto: string) => {
    setRespuestas((prev) => ({
      ...prev,
      [preguntaId]: texto,
    }));
    manejarCambio(preguntaId, texto);
  };

  const findPreguntaId = (rolKey: string, tipo: "calificacion" | "justificacion"): number => {
    const searchTerm = tipo === "calificacion" ? "calificación" : "justificación";
    const expectedEnunciado = `${searchTerm} - ${rolKey}`;

    const p = preguntas.find(
      (p) => p.enunciado.toLowerCase() === expectedEnunciado.toLowerCase()
    );
    return p ? p.id : 0;
  };

  return (
    <div className="card mt-3 shadow-sm border-0">
      <div className="card-header bg-primary text-white">
        <strong>
          {categoria.cod} - {categoria.texto}
        </strong>
      </div>

      <div className="card-body p-0">
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

                return (
                  <tr key={rol.key}>
                    <td className="fw-bold text-center">{rol.texto}</td>
                    <td>
                      <select
                        className="form-select"
                        value={respuestas[calificacionPId] || ""}
                        onChange={(e) =>
                          actualizarRespuesta(calificacionPId, e.target.value)
                        }
                        disabled={!calificacionPId}
                      >
                        {CALIFICACIONES.map((opt) => (
                          <option key={opt.valor} value={opt.valor}>
                            {opt.texto}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={respuestas[justificacionPId] || ""}
                        onChange={(e) =>
                          actualizarRespuesta(justificacionPId, e.target.value)
                        }
                        disabled={!justificacionPId}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}