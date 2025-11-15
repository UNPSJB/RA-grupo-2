import React, { useMemo } from "react";
import type { Pregunta, RespuestaInformeSintetico } from "../../../../types/types"; 
import { CampoTextArea, CampoPorcentaje } from "../../completarInformeSintetico/Campos"; 

interface PorcentajeHorasDetalle {
    porcentaje_teoricas: number | null;
    porcentaje_practicas: number | null;
    justificacion: string | null;
}

interface ItemPorcentajeHorasInfo {
    materia: NonNullable<RespuestaInformeSintetico['materia']>;
    porcentaje_teoricas: number | null;
    porcentaje_practicas: number | null;
    justificacion: string;
}

interface VistaPorcentajeHorasProps {
    pregunta: Pregunta;
    respuestasPorMateria: Record<number, RespuestaInformeSintetico>; 
}

export default function VistaPorcentajeHoras({
    pregunta,
    respuestasPorMateria,
}: VistaPorcentajeHorasProps) {

    const itemsAMostrar: ItemPorcentajeHorasInfo[] = useMemo(() => {
        return Object.values(respuestasPorMateria)
            .map(r => {
                if (!r.texto_respuesta || !r.materia) return null;
                
                try {
                    const datos = JSON.parse(r.texto_respuesta);
                    
                    const teoricas = parseFloat(datos.porcentaje_teoricas || "");
                    const practicas = parseFloat(datos.porcentaje_practicas || "");
                    
                    return {
                        materia: r.materia,
                        porcentaje_teoricas: isNaN(teoricas) ? null : teoricas,
                        porcentaje_practicas: isNaN(practicas) ? null : practicas,
                        justificacion: datos.justificacion || "—",
                    } as ItemPorcentajeHorasInfo;
                } catch (e) {
                    console.error(`Error al parsear respuesta P2 para materia ${r.materia.nombre}:`, e);
                    return null;
                }
            })
            .filter((item): item is ItemPorcentajeHorasInfo => item !== null)
            .sort((a, b) => a.materia.matricula.localeCompare(b.materia.matricula)); 
    }, [respuestasPorMateria]);

    return (
        <div className="container mt-4">
            <h5 className="text-dark mb-3">{pregunta.enunciado}</h5>

            {itemsAMostrar.length === 0 ? (
                <div className="alert alert-warning">
                    No hay información de porcentaje de horas registrada para esta pregunta.
                </div>
            ) : (
                <div className="accordion" id="accordionVistaP2">
                    {itemsAMostrar.map((item, index) => (
                        <div className="accordion-item" key={item.materia.id}>
                            <h2 className="accordion-header" id={`headingVP2${index}`}>
                                <button
                                    className="accordion-button collapsed"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target={`#collapseVP2${index}`}
                                    aria-expanded="false"
                                    aria-controls={`collapseVP2${index}`}
                                >
                                    {item.materia.matricula} - {item.materia.nombre}
                                </button>
                            </h2>
                            <div
                                id={`collapseVP2${index}`}
                                className="accordion-collapse collapse"
                                aria-labelledby={`headingVP2${index}`}
                                data-bs-parent="#accordionVistaP2"
                            >
                                <div className="accordion-body">
                                    <div className="row g-3">
                                        
                                        <CampoPorcentaje
                                            label="Porcentaje Clases Teóricas (%)"
                                            value={item.porcentaje_teoricas}
                                            onChange={() => {}} 
                                            isReadOnly={true}
                                        />

                                        <CampoPorcentaje
                                            label="Porcentaje Clases Prácticas (%)"
                                            value={item.porcentaje_practicas}
                                            onChange={() => {}}
                                            isReadOnly={true}
                                        />

                                        <CampoTextArea
                                            label="Justificación"
                                            value={item.justificacion}
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