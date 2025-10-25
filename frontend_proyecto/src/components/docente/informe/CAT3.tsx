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

export default function Categoria3Informe({ categoria, manejarCambio }: Props) {
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);

  const roles = ["Profesor", "JTP", "Auxiliar", "Auxiliar de Segunda"];
  const actividades = [
    "Capacitación",
    "Investigación",
    "Extensión",
    "Gestión",
    "Observaciones",
  ];

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

  const findPreguntaId = (rol: string, act: string): number => {
    const enunciadoBuscado = `${act} - ${rol}`;
    const p = preguntas.find(
      (p) => p.enunciado === enunciadoBuscado
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
                <th style={{ minWidth: "140px", verticalAlign: "middle" }}>Rol</th>
                {actividades.map((act) => (
                  <th key={act} style={{ minWidth: "170px" }}>
                    {act === "Observaciones" ? "Observaciones y comentarios" : act}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map((rol) => (
                <tr key={rol}>
                  <td className="fw-bold text-center">{rol}</td>
                  {actividades.map((act) => {
                    const pId = findPreguntaId(rol, act);
                    return (
                      <td key={`${rol}-${act}`}>
                        <textarea
                          className="form-control border-0"
                          rows={4}
                          value={respuestas[pId] || ""}
                          onChange={(e) =>
                            actualizarRespuesta(pId, e.target.value)
                          }
                          disabled={!pId}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}