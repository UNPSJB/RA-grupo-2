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
  nombresFuncion: { JTP: string; aux1: string; aux2: string }; 
  isReadOnly?: boolean;
}

const normalizarString = (texto: string): string => {
  if (!texto) return "";
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export default function Categoria3Informe({
  categoria,
  manejarCambio,
  respuestas,
  nombresFuncion,
  isReadOnly = false,
}: Props) {
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const roles = ["Profesor", "JTP", "Auxiliar de Primera", "Auxiliar de Segunda"];
  const actividades = ["Capacitación", "Investigación", "Extensión", "Gestión", "Observaciones"];
  const scrollTimeoutRef = useRef<number | null>(null);

  const autoExpand = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
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
    if (isReadOnly) return;
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    const headerElement = event.currentTarget.closest("h2.accordion-header");
    if (!headerElement) return;

    scrollTimeoutRef.current = window.setTimeout(() => {
      headerElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 360);
  };

  return (
    <Fragment>
      {roles.map((rol, index) => {
        const collapseId = `collapse-rol-${index}`;
        const headingId = `heading-rol-${index}`;

        let habilitado = true;
        if (rol === "JTP" && !nombresFuncion.JTP.trim()) habilitado = false;
        if (rol === "Auxiliar de Primera" && !nombresFuncion.aux1.trim()) habilitado = false;
        if (rol === "Auxiliar de Segunda" && !nombresFuncion.aux2.trim()) habilitado = false;

        return (
          <div className="accordion-item" key={rol}>
            <h2 className="accordion-header" id={headingId}>
              <button
                className={`accordion-button ${isReadOnly ? "" : "collapsed"}`}
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#${collapseId}`}
                onClick={handleAccordionToggle}
                disabled={isReadOnly}
              >
                {rol}
              </button>
            </h2>

            <div
              id={collapseId}
              className={`accordion-collapse collapse ${isReadOnly ? "show" : ""}`}
              data-bs-parent="#accordionPaso4"
            >
              <div className="accordion-body">
                {actividades.map((act) => {
                  const pId = findPreguntaId(rol, act);
                  const label = act === "Observaciones" ? "Observaciones y comentarios" : act;

                  return (
                    <div key={`${rol}-${act}`} className="mb-3">
                      <label htmlFor={`preg-${pId}`} className="form-label fw-bold">
                        {label}
                      </label>
                      {isReadOnly ? (
                        <p className="form-control-plaintext" style={{ whiteSpace: "pre-wrap" }}>
                          {respuestas[pId]?.texto_respuesta || "—"}
                        </p>
                      ) : (
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
                          style={{ resize: "none" }}
                          disabled={!pId || (!habilitado && rol !== "Profesor")}
                          placeholder={
                            !habilitado && rol !== "Profesor"
                              ? "Complete el nombre en Datos Generales para habilitar este campo"
                              : ""
                          }
                        />
                      )}
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
