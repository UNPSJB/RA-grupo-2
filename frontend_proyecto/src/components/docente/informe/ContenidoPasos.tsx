import { Fragment, useRef } from "react"; 
import Categoria2BInforme from "./CAT2B";
import Categoria2CInforme from "./CAT2C";
import Categoria3Informe from "./CAT3";
import Categoria4Informe from "./CAT4";
import CategoriaEquipamiento from "./CAT1";
import TablaDatosEstadisticos from "../../datosEstadisticos/TablaDatosEstadisticos";
import CompletarInformeCatedraFuncion from "./CompletarInformeCatedraFuncion";

interface Pregunta { id: number; enunciado: string; categoria_id: number; }
interface CategoriaConPreguntas { id: number; cod: string; texto: string; preguntas: Pregunta[]; }
interface OpcionPorcentaje { opcion_id: string; porcentaje: number; }
interface DatosEstadisticosPregunta { id_pregunta: string; datos: OpcionPorcentaje[]; }
interface DatosEstadisticosCategoria { categoria_cod: string; categoria_texto: string; promedio_categoria: OpcionPorcentaje[]; preguntas: DatosEstadisticosPregunta[]; }
type RespuestaValor = { opcion_id: number | null; texto_respuesta: string | null; };

interface ContenidoPasosProps {
  currentStep: number;
  categoriasConPreguntas: CategoriaConPreguntas[];
  datosEstadisticos: DatosEstadisticosCategoria[];
  cantidad: number;
  respuestas: Record<number, RespuestaValor>;
  docenteMateriaId: number;
 
  manejarCambio: (preguntaId: number, valor: RespuestaValor) => void;
  onDatosGenerados: (datos: any) => void;
}

const normalizarString = (texto: string): string => {
  if (!texto) return "";
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export default function ContenidoPasos({
  currentStep,
  categoriasConPreguntas,
  datosEstadisticos,
  cantidad,
  respuestas,
  docenteMateriaId,
  manejarCambio,
  onDatosGenerados
}: ContenidoPasosProps) {

  const categoria1 = categoriasConPreguntas.find(cat => cat.cod === "1");
  const categoria2 = categoriasConPreguntas.find(cat => cat.cod === "2");
  const categoria2A = categoriasConPreguntas.find(cat => cat.cod === "2.A");
  const categoria2B = categoriasConPreguntas.find(cat => cat.cod === "2.B");
  const categoria2C = categoriasConPreguntas.find(cat => cat.cod === "2.C");
  const categoria3 = categoriasConPreguntas.find(cat => cat.cod === "3");
  const categoria4 = categoriasConPreguntas.find(cat => cat.cod === "4");


  const renderCategoriaGenerica = (categoria: CategoriaConPreguntas) => {
    const autoExpand = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
      const textarea = e.currentTarget;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    };

    return (
      <Fragment> 
        {categoria.preguntas.map((pregunta) => (
          <div key={pregunta.id} className="mb-4">
            <h6 className="fw-bold mb-3 text-dark">
              {pregunta.enunciado}
              <span className="text-danger ms-1">*</span>
            </h6>
            <textarea
              id={`pregunta-${pregunta.id}`}
              className="form-control"
              rows={4}
              value={respuestas[pregunta.id]?.texto_respuesta || ""}
              onChange={(e) => {
                manejarCambio(pregunta.id, {
                  opcion_id: null,
                  texto_respuesta: e.target.value,
                });
                autoExpand(e);
              }}
              onInput={autoExpand}
              placeholder="Escriba su respuesta aquí..."
              style={{ 
                resize: 'none', 
                minHeight: '100px',
                overflow: 'hidden' 
              }}
            />
          </div>
        ))}
      </Fragment>
    );
  };

  const renderCategoria2 = (categoria: CategoriaConPreguntas) => {
    const pTeoricas = categoria.preguntas.find(p => normalizarString(p.enunciado).includes("clases teoricas"));
    const pPracticas = categoria.preguntas.find(p => normalizarString(p.enunciado).includes("clases practicas"));
  

    return (
      <div className="row g-3">
        <div className="col-md-6">
          <label htmlFor={`preg-${pTeoricas?.id}`} className="form-label">
            {pTeoricas?.enunciado || "Porcentaje Clases Teóricas"}
          </label>
          <input
            type="number"
            className="form-control"
            id={`preg-${pTeoricas?.id}`}
            value={respuestas[pTeoricas?.id || 0]?.texto_respuesta || ""}
            onChange={(e) => pTeoricas && manejarCambio(pTeoricas.id, { opcion_id: null, texto_respuesta: e.target.value })}
            disabled={!pTeoricas}
          />
        </div>
        <div className="col-md-6">
          <label htmlFor={`preg-${pPracticas?.id}`} className="form-label">
            {pPracticas?.enunciado || "Porcentaje Clases Prácticas"}
          </label>
          <input
            type="number"
            className="form-control"
            id={`preg-${pPracticas?.id}`}
            value={respuestas[pPracticas?.id || 0]?.texto_respuesta || ""}
            onChange={(e) => pPracticas && manejarCambio(pPracticas.id, { opcion_id: null, texto_respuesta: e.target.value })}
            disabled={!pPracticas}
          />
        </div>
      </div>
    );
  };

  const scrollTimeoutRef = useRef<number | null>(null);

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

  switch (currentStep) {
    case 1:
      return (
        <CompletarInformeCatedraFuncion
          docenteMateriaId={docenteMateriaId}
          onDatosGenerados={onDatosGenerados}
        />
      );

    case 2:
      return (
        <Fragment>
          <h5 className="text-dark fw-bold mb-3">Resultados de Encuestas</h5>
          <p className="text-muted mb-4">
            Análisis basado en las encuestas completadas por los estudiantes.
          </p>
          <hr className="mb-4" />

          <TablaDatosEstadisticos 
            datos={datosEstadisticos}
            cant={cantidad} 
          />
        </Fragment>
      );

    case 3:
      return categoria1 ? (
        <Fragment>
          <h5 className="text-dark fw-bold mb-3">1. Equipamiento y Bibliografía</h5>
          <p className="text-muted mb-4">{categoria1.texto}</p>
          <hr className="mb-4" />
          <CategoriaEquipamiento
            categoria={categoria1}
            manejarCambio={manejarCambio}
          />
        </Fragment>
      ) : null;

    case 4:
      return (
        <Fragment>
          <h5 className="text-dark fw-bold mb-3">2. Desarrollo Curricular</h5>
          <hr className="mb-4" />
          <div className="accordion accordion-flush" id="accordionPaso3">
            {categoria2 && (
              <div className="accordion-item">
                <h2 className="accordion-header" id="heading2">
                  <button 
                    className="accordion-button collapsed" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#collapse2"
                    onClick={handleAccordionToggle} 
                  >
                    2. Porcentaje de Horas de Clases
                  </button>
                </h2>
                <div id="collapse2" className="accordion-collapse collapse" data-bs-parent="#accordionPaso3">
                  <div className="accordion-body">
                    <p className="text-muted mb-3">{categoria2.texto}</p>
                    {renderCategoria2(categoria2)}
                  </div>
                </div>
              </div>
            )}            
            {categoria2A && (
              <div className="accordion-item">
                <h2 className="accordion-header" id="heading2A">
                  <button 
                    className="accordion-button collapsed" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#collapse2A"
                    onClick={handleAccordionToggle} 
                  >
                    2.A. Totalidad de Contenidos
                  </button>
                </h2>
                <div id="collapse2A" className="accordion-collapse collapse" data-bs-parent="#accordionPaso3">
                  <div className="accordion-body">
                    <p className="text-muted mb-3">{categoria2A.texto}</p>
                    {renderCategoriaGenerica(categoria2A)}
                  </div>
                </div>
              </div>
            )}

            {categoria2B && (
              <div className="accordion-item">
                <h2 className="accordion-header" id="heading2B">
                  <button 
                    className="accordion-button collapsed" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#collapse2B"
                    onClick={handleAccordionToggle}
                  >
                    2.B. Análisis de Encuestas
                  </button>
                </h2>
                <div id="collapse2B" className="accordion-collapse collapse" data-bs-parent="#accordionPaso3">
                  <div className="accordion-body">
                    <p className="text-muted mb-3">{categoria2B.texto}</p>
                    <Categoria2BInforme
                      categoria={categoria2B}
                      manejarCambio={manejarCambio}
                      estadisticas={datosEstadisticos}
                      respuestas={respuestas}
                    />
                  </div>
                </div>
              </div>
            )}

            {categoria2C && (
              <div className="accordion-item">
                <h2 className="accordion-header" id="heading2C">
                  <button 
                    className="accordion-button collapsed" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#collapse2C"
                    onClick={handleAccordionToggle}
                  >
                    2.C. Reflexión Docente
                  </button>
                </h2>
                <div id="collapse2C" className="accordion-collapse collapse" data-bs-parent="#accordionPaso3">
                  <div className="accordion-body">
                    <p className="text-muted mb-3">{categoria2C.texto}</p>
                    <Categoria2CInforme
                      categoria={categoria2C}
                      manejarCambio={manejarCambio}
                      respuestas={respuestas}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </Fragment> 
      );

    case 5:
      return categoria3 ? (
        <Fragment>
          <h5 className="text-dark fw-bold mb-3">3. Actividades del Equipo Docente</h5>
          <p className="text-muted mb-4">{categoria3.texto}</p>
          <hr className="mb-4" />
          <div className="accordion accordion-flush" id="accordionPaso4">
            <Categoria3Informe
              categoria={categoria3}
              manejarCambio={manejarCambio}
              respuestas={respuestas}
            />
          </div>
        </Fragment>
      ) : null;

    case 6:
      return (
        <Fragment>
          {categoria4 && (
            <div className="mb-4">
              <h5 className="text-dark fw-bold mb-3">4. Valoración de Auxiliares</h5>
              <p className="text-muted mb-4">{categoria4.texto}</p>
              <hr className="mb-4" />
              <Categoria4Informe
                categoria={categoria4}
                manejarCambio={manejarCambio}
                respuestas={respuestas}
              />
            </div>
          )}
        </Fragment>
      );

    default:
      return null;
  }
}
