import { useMemo } from "react";
import type { Pregunta, RespuestaInformeSintetico } from "../../../../types/types"; 
import { CampoTextArea, CampoTexto } from "../../completarInformeSintetico/Campos";  

interface AnalisisEncuestasDetalle {
    encuesta_B: string;
    encuesta_C: string;
    encuesta_D: string;
    encuesta_ET: string;
    encuesta_EP: string;
    juicio_valor: string;
}

interface ItemAnalisisEncuestasInfo {
    materia: NonNullable<RespuestaInformeSintetico['materia']>;
    datos: AnalisisEncuestasDetalle;
}

interface VistaAnalisisEncuestasProps {
    pregunta: Pregunta;
    respuestasPorMateria: Record<number, RespuestaInformeSintetico>; 
}

export default function VistaAnalisisEncuestas({
    pregunta,
    respuestasPorMateria,
}: VistaAnalisisEncuestasProps) {

    const itemsAMostrar: ItemAnalisisEncuestasInfo[] = useMemo(() => {
        return Object.values(respuestasPorMateria)
            .map(r => {
                if (!r.texto_respuesta || !r.materia) return null;
                
                try {
                    const datos: AnalisisEncuestasDetalle = JSON.parse(r.texto_respuesta);
                    
                    return {
                        materia: r.materia,
                        datos: {
                            encuesta_B: datos.encuesta_B || "—",
                            encuesta_C: datos.encuesta_C || "—",
                            encuesta_D: datos.encuesta_D || "—",
                            encuesta_ET: datos.encuesta_ET || "—",
                            encuesta_EP: datos.encuesta_EP || "—",
                            juicio_valor: datos.juicio_valor || "—",
                        }
                    } as ItemAnalisisEncuestasInfo;
                } catch (e) {
                    console.error(`Error al parsear respuesta 2B para materia ${r.materia.nombre}:`, e);
                    return null;
                }
            })
            .filter((item): item is ItemAnalisisEncuestasInfo => item !== null)
            .sort((a, b) => a.materia.matricula.localeCompare(b.materia.matricula)); 
    }, [respuestasPorMateria]);

    return (
        <div className="container mt-4">
            <h5 className="text-dark mb-3">2.B. {pregunta.enunciado}</h5>

            {itemsAMostrar.length === 0 ? (
                <div className="alert alert-warning">
                    No hay datos de análisis de encuestas registrados.
                </div>
            ) : (
                <div className="accordion" id="accordionVistaP2B">
                    {itemsAMostrar.map((item, index) => (
                        <div className="accordion-item" key={item.materia.id}>
                            <h2 className="accordion-header" id={`headingVP2B${index}`}>
                                <button
                                    className="accordion-button collapsed"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target={`#collapseVP2B${index}`}
                                    aria-expanded="false"
                                    aria-controls={`collapseVP2B${index}`}
                                >
                                    {item.materia.matricula} - {item.materia.nombre}
                                </button>
                            </h2>
                            <div
                                id={`collapseVP2B${index}`}
                                className="accordion-collapse collapse"
                                aria-labelledby={`headingVP2B${index}`}
                                data-bs-parent="#accordionVistaP2B"
                            >
                                <div className="accordion-body">
                                    <div className="row g-3">
                                        <label className="form-label fw-bold mt-2">Respuestas de Encuestas por Categoría:</label>
                                        
                                        <CampoTexto
                                            label="B: Comunicación y desarrollo"
                                            value={item.datos.encuesta_B}
                                            readOnly={true} 
                                            onChange={() => {}}
                                        />

                                        <CampoTexto
                                            label="C: Metodología"
                                            value={item.datos.encuesta_C}
                                            readOnly={true} 
                                            onChange={() => {}}
                                        />

                                        <CampoTexto
                                            label="D: Evaluación"
                                            value={item.datos.encuesta_D}
                                            readOnly={true} 
                                            onChange={() => {}}
                                        />

                                        <CampoTexto
                                            label="E(TEORIA): Actuación miembros Cátedra"
                                            value={item.datos.encuesta_ET}
                                            readOnly={true} 
                                            onChange={() => {}}
                                        />

                                        <CampoTexto
                                            label="E(PRACTICA): Actuación miembros Cátedra"
                                            value={item.datos.encuesta_EP}
                                            readOnly={true} 
                                            onChange={() => {}}
                                        />

                                        <CampoTextArea
                                            label="Juicio de valor (Comentarios del Docente)"
                                            value={item.datos.juicio_valor}
                                            isReadOnly={true} 
                                            onChange={() => {}}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}