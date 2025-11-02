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
  materiaId: number;
  materiaNombre: string;
  anio: number;
  periodo: string;
  cantidadInscriptos: number;
  manejarCambio: (preguntaId: number, valor: RespuestaValor) => void;
  onDatosGenerados: (datos: any) => void;
}


export default function ContenidoPasos({
  currentStep,
  categoriasConPreguntas,
  datosEstadisticos,
  cantidad,
  respuestas,
  docenteMateriaId,
  materiaId,
  materiaNombre,
  anio,
  periodo,
  cantidadInscriptos,
  manejarCambio,
  onDatosGenerados
}: ContenidoPasosProps) {

  const categoria1 = categoriasConPreguntas.find(cat => cat.cod === "1");
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
    const limpiarEnunciado = (texto: string) => {
      const parts = texto.split(". ");
      if (parts.length < 2) return texto;
      const prefijo = parts[0];
      if (!isNaN(parseInt(prefijo))) { return parts.slice(1).join(". "); }
      return texto;
    };
    return (
      <Fragment> 
        {categoria.preguntas.map((pregunta, i) => (
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

    case 3:
      return (
        <Fragment>
          <h5 className="text-dark fw-bold mb-3">2. Desarrollo Curricular</h5>
          <hr className="mb-4" />
          <div className="accordion accordion-flush" id="accordionPaso3">
            
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
                    <TablaDatosEstadisticos 
                      datos={datosEstadisticos}
                      cant={cantidad} 
                    />
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

    case 4:
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

    case 5:
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