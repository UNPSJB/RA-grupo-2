import React, { useMemo } from "react";
import type { Pregunta, RespuestaInformeSintetico } from "../../../../types/types";  
import { CampoTextArea } from "../../completarInformeSintetico/Campos"; 

interface NecesidadesDetalle {
    bibliografia: string;
    equipamiento: string;
}

interface ItemNecesidadesInfo {
    materia: NonNullable<RespuestaInformeSintetico['materia']>;
    bibliografia: string;
    equipamiento: string;
}

interface VistaNecesidadesProps {
    pregunta: Pregunta;
    respuestasPorMateria: Record<number, RespuestaInformeSintetico>; 
}

export default function VistaEquipamientoBibliografia({
    pregunta,
    respuestasPorMateria,
}: VistaNecesidadesProps) {

    const itemsAMostrar: ItemNecesidadesInfo[] = useMemo(() => {
        return Object.values(respuestasPorMateria)
            .map(r => {
                if (!r.texto_respuesta || !r.materia) return null;
                
                try {
                    const datos: NecesidadesDetalle = JSON.parse(r.texto_respuesta);
                    return {
                        materia: r.materia,
                        bibliografia: datos.bibliografia || "—",
                        equipamiento: datos.equipamiento || "—",
                    } as ItemNecesidadesInfo;
                } catch (e) {
                    console.error(`Error al parsear respuesta P1 para materia ${r.materia.nombre}:`, e);
                    return null;
                }
            })
            .filter((item): item is ItemNecesidadesInfo => item !== null)
            .sort((a, b) => a.materia.matricula.localeCompare(b.materia.matricula)); 
    }, [respuestasPorMateria]);

    return (
        <div className="container mt-4">
            <h5 className="text-dark mb-3">1. Equipamiento y Bibliografía</h5>
            <p className="text-muted mb-4">{pregunta.enunciado}</p>

            {itemsAMostrar.length === 0 ? (
                <div className="alert alert-warning">
                    No hay información de necesidades registrada para esta pregunta.
                </div>
            ) : (
                <div className="accordion" id="accordionVistaP1">
                    {itemsAMostrar.map((item, index) => (
                        <div className="accordion-item" key={item.materia.id}>
                            <h2 className="accordion-header" id={`headingVP1${index}`}>
                                <button
                                    className="accordion-button collapsed"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target={`#collapseVP1${index}`}
                                    aria-expanded="false"
                                    aria-controls={`collapseVP1${index}`}
                                >
                                    {item.materia.matricula} - {item.materia.nombre}
                                </button>
                            </h2>
                            <div
                                id={`collapseVP1${index}`}
                                className="accordion-collapse collapse"
                                aria-labelledby={`headingVP1${index}`}
                                data-bs-parent="#accordionVistaP1"
                            >
                                <div className="accordion-body">
                                    <div className="row g-3">
                                        
                                        <CampoTextArea
                                            label="Equipamiento e insumos"
                                            value={item.equipamiento}
                                            onChange={() => {}} 
                                            isReadOnly={true}
                                        />

                                        <CampoTextArea
                                            label="Bibliografía"
                                            value={item.bibliografia}
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