import React, { useMemo } from "react";
import type { Pregunta, RespuestaInformeSintetico } from "../../../../types/types"; 
import { CampoTextArea, CampoPorcentaje } from "../../completarInformeSintetico/Campos"; 

interface ContenidosDetalle {
    porcentaje: number | null;
    estrategias: string | null;
}

interface ItemContenidosInfo {
    materia: NonNullable<RespuestaInformeSintetico['materia']>;
    porcentaje: number | null;
    estrategias: string;
}

interface VistaContenidosProps {
    pregunta: Pregunta;
    respuestasPorMateria: Record<number, RespuestaInformeSintetico>; 
}

export default function VistaContenidosAlcanzados({
    pregunta,
    respuestasPorMateria,
}: VistaContenidosProps) {

    const itemsAMostrar: ItemContenidosInfo[] = useMemo(() => {
        return Object.values(respuestasPorMateria)
            .map(r => {
                if (!r.texto_respuesta || !r.materia) return null;
                
                try {
                    const datos = JSON.parse(r.texto_respuesta);
                    
                    const porcentajeNum = parseFloat(datos.porcentaje || "");
                    
                    return {
                        materia: r.materia,
                        porcentaje: isNaN(porcentajeNum) ? null : porcentajeNum,
                        estrategias: datos.estrategias || "—",
                    } as ItemContenidosInfo;
                } catch (e) {
                    console.error(`Error al parsear respuesta 2A para materia ${r.materia.nombre}:`, e);
                    return null;
                }
            })
            .filter((item): item is ItemContenidosInfo => item !== null)
            .sort((a, b) => a.materia.matricula.localeCompare(b.materia.matricula)); 
    }, [respuestasPorMateria]);

    return (
        <div className="container mt-4">
            <h5 className="text-dark mb-3">2.A. {pregunta.enunciado}</h5>

            {itemsAMostrar.length === 0 ? (
                <div className="alert alert-warning">
                    No hay información de contenidos alcanzados registrada.
                </div>
            ) : (
                <div className="accordion" id="accordionVistaP2A">
                    {itemsAMostrar.map((item, index) => (
                        <div className="accordion-item" key={item.materia.id}>
                            <h2 className="accordion-header" id={`headingVP2A${index}`}>
                                <button
                                    className="accordion-button collapsed"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target={`#collapseVP2A${index}`}
                                    aria-expanded="false"
                                    aria-controls={`collapseVP2A${index}`}
                                >
                                    {item.materia.matricula} - {item.materia.nombre}
                                </button>
                            </h2>
                            <div
                                id={`collapseVP2A${index}`}
                                className="accordion-collapse collapse"
                                aria-labelledby={`headingVP2A${index}`}
                                data-bs-parent="#accordionVistaP2A"
                            >
                                <div className="accordion-body">
                                    <div className="row g-3">
                                        
                                        <CampoPorcentaje
                                            label="Porcentual contenidos alcanzados (%)"
                                            value={item.porcentaje}
                                            onChange={() => {}} 
                                            isReadOnly={true}
                                        />

                                        <CampoTextArea
                                            label="Estrategias propuestas"
                                            value={item.estrategias}
                                            onChange={() => {}}
                                            isReadOnly={true}
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