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
  autoExpand: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export default function Categoria3Informe({ categoria, manejarCambio, autoExpand }: Props) {
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [rolDesplegado, setRolDesplegado] = useState<string | null>(null);

  const roles = ["Profesor", "JTP", "Auxiliar de Primera", "Auxiliar de Segunda"];
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
    
    manejarCambio(preguntaId, {
      opcion_id: null,
      texto_respuesta: texto,
    });
  };

  const findPreguntaId = (rol: string, act: string): number => {
    const enunciadoBuscado = `${act} - ${rol}`;
    const p = preguntas.find(
      (p) => p.enunciado === enunciadoBuscado
    );
    return p ? p.id : 0;
  };

  const toggleDesplegar = (rol: string) => {
    setRolDesplegado(rolDesplegado === rol ? null : rol);
  };

  return (
    <div className="card-body p-0">
      {roles.map((rol) => {
        const nombrePreguntaId = 
          preguntas.find(p => p.enunciado === `Nombre - ${rol}`)?.id || 0;
        
        const estaDesplegado = rolDesplegado === rol;

        return (
          <div key={rol} className="mb-3 border rounded">
            <div 
              className="p-3 bg-light d-flex justify-content-between align-items-center cursor-pointer"
              onClick={() => toggleDesplegar(rol)}
              style={{ cursor: 'pointer' }}
            >
              <h6 className="fw-bold mb-0">{rol}</h6>
              <span className="fs-5">
                {estaDesplegado ? '−' : '+'}
              </span>
            </div>

            {estaDesplegado && (
              <div className="p-3">
                <div className="mb-3">
                  <label htmlFor={`preg-nombre-${nombrePreguntaId}`} className="form-label">
                    Nombre del {rol}
                  </label>
                  <input
                    type="text"
                    id={`preg-nombre-${nombrePreguntaId}`}
                    className="form-control"
                    value={respuestas[nombrePreguntaId] || ""}
                    onChange={(e) => 
                      actualizarRespuesta(nombrePreguntaId, e.target.value)
                    }
                    disabled={!nombrePreguntaId}
                  />
                </div>
                
                {actividades.map((act) => {
                  const pId = findPreguntaId(rol, act);
                  const label = act === "Observaciones" ? "Observaciones y comentarios" : act;
                  
                  return (
                    <div key={`${rol}-${act}`} className="mb-3">
                      <label htmlFor={`preg-${pId}`} className="form-label">
                        {label}
                      </label>
                      <textarea
                        id={`preg-${pId}`}
                        className="form-control"
                        rows={3}
                        value={respuestas[pId] || ""}
                        onChange={(e) => {
                          actualizarRespuesta(pId, e.target.value)
                          autoExpand(e);
                        }}
                        onInput={autoExpand}
                        style={{ resize: 'none'}}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}