import { useMemo } from "react";
import type { Pregunta, RespuestaInformeSintetico } from "../../../../types/types"; 
import { CampoTextArea } from "../../completarInformeSintetico/Campos";  

interface ReflexionDocenteDetalle {
    aspectos_positivos_ensenanza: string | null;
    aspectos_positivos_aprendizaje: string | null;
    obstaculos_ensenanza: string | null;
    obstaculos_aprendizaje: string | null;
    estrategias: string | null;
}

interface RespuestasGarantizadasString {
    aspectos_positivos_ensenanza: string; 
    aspectos_positivos_aprendizaje: string; 
    obstaculos_ensenanza: string; 
    obstaculos_aprendizaje: string; 
    estrategias: string; 
}

interface ItemReflexionDocenteInfo {
    materia: NonNullable<RespuestaInformeSintetico['materia']>;
    respuestas: RespuestasGarantizadasString;
}

interface VistaReflexionDocenteProps {
    pregunta: Pregunta;
    respuestasPorMateria: Record<number, RespuestaInformeSintetico>; 
}

export default function VistaReflexionDocente({
    pregunta,
    respuestasPorMateria,
}: VistaReflexionDocenteProps) {

    const safeString = (value: string | null | undefined): string => value || "";

    const itemsAMostrar: ItemReflexionDocenteInfo[] = useMemo(() => {
        return Object.values(respuestasPorMateria)
            .map(r => {
                if (!r.texto_respuesta || !r.materia) return null;
                
                try {
                    const datos: ReflexionDocenteDetalle = JSON.parse(r.texto_respuesta);
                    
                    return {
                        materia: r.materia,
                        respuestas: {
                            aspectos_positivos_ensenanza: safeString(datos.aspectos_positivos_ensenanza),
                            aspectos_positivos_aprendizaje: safeString(datos.aspectos_positivos_aprendizaje),
                            obstaculos_ensenanza: safeString(datos.obstaculos_ensenanza),
                            obstaculos_aprendizaje: safeString(datos.obstaculos_aprendizaje),
                            estrategias: safeString(datos.estrategias),
                        } as RespuestasGarantizadasString
                    };
                } catch (e) {
                    console.error(`Error al parsear respuesta 2C para materia ${r.materia.nombre}:`, e);
                    return null;
                }
            })
            .filter((item): item is ItemReflexionDocenteInfo => item !== null)
            .sort((a, b) => a.materia.matricula.localeCompare(b.materia.matricula)); 
    }, [respuestasPorMateria]);

    return (
        <div className="container mt-4">
            <h5 className="text-dark mb-3">2.C. {pregunta.enunciado}</h5>

            {itemsAMostrar.length === 0 ? (
                <div className="alert alert-warning">
                    No hay información de reflexión docente registrada.
                </div>
            ) : (
                <div className="accordion" id="accordionVistaP2C">
                    {itemsAMostrar.map((item, index) => (
                        <div className="accordion-item" key={item.materia.id}>
                            <h2 className="accordion-header" id={`headingVP2C_${index}`}>
                                <button
                                    className="accordion-button collapsed"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target={`#collapseVP2C_${index}`}
                                    aria-expanded="false"
                                    aria-controls={`collapseVP2C_${index}`}
                                >
                                    {item.materia.matricula} - {item.materia.nombre}
                                </button>
                            </h2>
                            <div
                                id={`collapseVP2C_${index}`}
                                className="accordion-collapse collapse"
                                aria-labelledby={`headingVP2C_${index}`}
                                data-bs-parent="#accordionVistaP2C"
                            >
                                <div className="accordion-body">
                                    <div className="row g-3">
                                        
                                        <CampoTextArea
                                            label="Aspectos positivos: Proceso Enseñanza"
                                            value={item.respuestas.aspectos_positivos_ensenanza}
                                            isReadOnly={true}
                                            onChange={() => {}}
                                        />
                                        
                                        <CampoTextArea
                                            label="Aspectos positivos: Proceso de aprendizaje"
                                            value={item.respuestas.aspectos_positivos_aprendizaje}
                                            isReadOnly={true}
                                            onChange={() => {}}
                                        />
                                        
                                        <CampoTextArea
                                            label="Obstáculos: Proceso Enseñanza"
                                            value={item.respuestas.obstaculos_ensenanza}
                                            isReadOnly={true}
                                            onChange={() => {}}
                                        />
                                        
                                        <CampoTextArea
                                            label="Obstáculos: Proceso de aprendizaje"
                                            value={item.respuestas.obstaculos_aprendizaje}
                                            isReadOnly={true}
                                            onChange={() => {}}
                                        />
                                        
                                        <CampoTextArea
                                            label="Estrategias a implementar"
                                            value={item.respuestas.estrategias}
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