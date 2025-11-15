import { useMemo } from "react";
import type { Pregunta, RespuestaInformeSintetico } from "../../../../types/types"; 
import { CampoTextoNumero } from "../../completarInformeSintetico/Campos"; 

interface InfoGeneralDetalle {
    cant_alumnos: number;
    cant_comisiones_t: number;
    cant_comisiones_p: number;
}

interface ItemMateriaInfo {
    materia: NonNullable<RespuestaInformeSintetico['materia']>;
    cant_alumnos: number;
    cant_comisiones_t: number;
    cant_comisiones_p: number;
}

interface VistaInformacionGeneralProps {
    pregunta: Pregunta;
    respuestasPorMateria: Record<number, RespuestaInformeSintetico>; 
}

export default function VistaInformacionGeneral({
    pregunta,
    respuestasPorMateria,
}: VistaInformacionGeneralProps) {

    const itemsAMostrar: ItemMateriaInfo[] = useMemo(() => {
        return Object.values(respuestasPorMateria)
            .map(r => {
                if (!r.texto_respuesta || !r.materia) return null;
                
                try {
                    const datos: InfoGeneralDetalle = JSON.parse(r.texto_respuesta);
                    return {
                        materia: r.materia,
                        ...datos
                    } as ItemMateriaInfo;
                } catch (e) {
                    console.error(`Error al parsear respuesta P0 para materia ${r.materia.nombre}:`, e);
                    return null;
                }
            })
            .filter((item): item is ItemMateriaInfo => item !== null)
            .sort((a, b) => a.materia.matricula.localeCompare(b.materia.matricula)); 
    }, [respuestasPorMateria]);


    return (
        <div className="container mt-4">
            <h5 className="text-dark mb-3">{pregunta.enunciado}</h5>

            {itemsAMostrar.length === 0 ? (
                <div className="alert alert-warning">
                    No hay información de materias disponible para esta pregunta.
                </div>
            ) : (
                <div className="accordion" id="accordionVistaP0">
                    {itemsAMostrar.map((item, index) => (
                        <div className="accordion-item" key={item.materia.id}>
                            <h2 className="accordion-header" id={`headingVP0${index}`}>
                                <button
                                    className="accordion-button collapsed"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target={`#collapseVP0${index}`}
                                    aria-expanded="false"
                                    aria-controls={`collapseVP0${index}`}
                                >
                                    {item.materia.matricula} - {item.materia.nombre}
                                </button>
                            </h2>
                            <div
                                id={`collapseVP0${index}`}
                                className="accordion-collapse collapse"
                                aria-labelledby={`headingVP0${index}`}
                                data-bs-parent="#accordionVistaP0"
                            >
                                <div className="accordion-body">
                                    <div className="row g-3">
                                        <CampoTextoNumero
                                            label="Cantidad de alumnos"
                                            value={item.cant_alumnos || 0}
                                            onChange={() => {}} 
                                            isReadOnly={true} 
                                        />
                                        <CampoTextoNumero
                                            label="Comisiones Teóricas"
                                            value={item.cant_comisiones_t || 0}
                                            onChange={() => {}}
                                            isReadOnly={true}
                                        />
                                        <CampoTextoNumero
                                            label="Comisiones Prácticas"
                                            value={item.cant_comisiones_p || 0}
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