import { useEffect, useState, Fragment, useRef } from "react";

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
  respuestas: Record<number, RespuestaValor>;
}

const normalizarString = (texto: string): string => {
  if (!texto) return "";
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export default function Categoria3Informe({ categoria, manejarCambio, respuestas }: Props) {
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const roles = ["Profesor", "JTP", "Auxiliar de Primera", "Auxiliar de Segunda"];
  const actividades = ["Capacitación", "Investigación", "Extensión", "Gestión", "Observaciones"];

  const scrollTimeoutRef = useRef<number | null>(null);

  const autoExpand = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  useEffect(() => {
    if (!categoria) return;
    setPreguntas(categoria.preguntas);
  }, [categoria]);

  const actualizarRespuesta = (preguntaId: number, texto: string) => {
    manejarCambio(preguntaId, { opcion_id: null, texto_respuesta: texto });
  };

  const findPreguntaId = (rol: string, act: string): number => {
    const enunciadoBuscado = normalizarString(`${act} - ${rol}`);
    const p = preguntas.find(
      (p) => normalizarString(p.enunciado) === enunciadoBuscado
    );
    return p ? p.id : 0;
  };

  const handleAccordionToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    const headerElement = event.currentTarget.closest('h2.accordion-header');
    if (!headerElement) return;

    scrollTimeoutRef.current = setTimeout(() => {
      headerElement.scrollIntoView({
        behavior: "smooth", 
        block: "start",    
      });
    }, 360); 
  };

  return (
    <Fragment>
      {roles.map((rol, index) => {
        const nombrePreguntaId = 
          preguntas.find(p => normalizarString(p.enunciado) === normalizarString(`Nombre - ${rol}`))?.id || 0;
        
        const collapseId = `collapse-rol-${index}`;
        const headingId = `heading-rol-${index}`;
        
        return (
          <div className="accordion-item" key={rol}>
            <h2 className="accordion-header" id={headingId}>
              <button 
                className="accordion-button collapsed" 
                type="button" 
                data-bs-toggle="collapse" 
                data-bs-target={`#${collapseId}`}
                onClick={handleAccordionToggle}
              >
                {rol}
              </button>
            </h2>
            <div 
              id={collapseId} 
              className="accordion-collapse collapse" 
              data-bs-parent="#accordionPaso4"
            >
              <div className="accordion-body">
                <div className="mb-3">
                  <label htmlFor={`preg-nombre-${nombrePreguntaId}`} className="form-label">
                    Nombre del {rol}
                  </label>
                  <textarea
                    id={`preg-nombre-${nombrePreguntaId}`}
                    className="form-control"
                    rows={1}
                    value={respuestas[nombrePreguntaId]?.texto_respuesta || ""}
                    onChange={(e) => {
                      actualizarRespuesta(nombrePreguntaId, e.target.value);
                      autoExpand(e);
                    }}
                    onInput={autoExpand}
                    disabled={!nombrePreguntaId}
                    style={{ resize: "none" }}
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
                        value={respuestas[pId]?.texto_respuesta || ""}
                        onChange={(e) => {
                          actualizarRespuesta(pId, e.target.value);
                          autoExpand(e);
                        }}
                        onInput={autoExpand}
                        style={{ resize: 'none'}}
                        disabled={!pId}
                      />
                    </div>
                  );
                })}
              </div> 
            </div>
          </div> 
        );
      })}
    </Fragment>
  );
}