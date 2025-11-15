import { useMemo } from "react";
import type { Pregunta, RespuestaInformeSintetico } from "../../../types/types"; 

import VistaPregunta0 from "./vistas/Pregunta0";
import VistaEquipamientoBibliografia from "./vistas/Pregunta1"; 
import VistaPorcentajeHoras from "./vistas/Pregunta2"; 
import VistaContenidosAlcanzados from "./vistas/Pregunta2A"; 
import VistaAnalisisEncuestas from "./vistas/Pregunta2B"; 
import VistaReflexionDocente from "./vistas/Pregunta2C"; 
import VistaActividadesDocentes from "./vistas/Pregunta3";
import VistaDesempenoAuxiliares from "./vistas/Pregunta4";
import { CampoTextArea } from "../completarInformeSintetico/Campos";

interface ContenidoInformeSinteticoProps {
    pregunta: Pregunta;
    todasLasRespuestas: RespuestaInformeSintetico[];
}

export default function ContenidoInformeSintetico({ 
    pregunta, 
    todasLasRespuestas 
}: ContenidoInformeSinteticoProps) {

    const respuestasDeEstaPregunta = useMemo(() => {
        return todasLasRespuestas
            .filter(r => r.pregunta_id === pregunta.id)
            .reduce((acc, r) => {
                const key = r.materia_id !== null ? r.materia_id : r.id; 
                acc[key] = r;
                return acc;
            }, {} as Record<number, RespuestaInformeSintetico>);
    }, [todasLasRespuestas, pregunta.id]);
    
    const renderComponente = () => {
        const cod = pregunta.cod.toUpperCase().trim();

        switch (cod) {
            case '0': 
                return (
                    <VistaPregunta0 
                        pregunta={pregunta} 
                        respuestasPorMateria={respuestasDeEstaPregunta} 
                    />
                );

            case '1': 
                return (
                    <VistaEquipamientoBibliografia 
                        pregunta={pregunta} 
                        respuestasPorMateria={respuestasDeEstaPregunta} 
                    />
                );
            case '2': 
                return (
                    <VistaPorcentajeHoras 
                        pregunta={pregunta} 
                        respuestasPorMateria={respuestasDeEstaPregunta} 
                    />
                );
            case '2.A': 
                return (
                    <VistaContenidosAlcanzados 
                        pregunta={pregunta} 
                        respuestasPorMateria={respuestasDeEstaPregunta} 
                    />
                )
            case '2.B': 
                return (
                    <VistaAnalisisEncuestas 
                        pregunta={pregunta} 
                        respuestasPorMateria={respuestasDeEstaPregunta} 
                    />
                );
            case '2.C': 
                return (
                    <VistaReflexionDocente 
                        pregunta={pregunta} 
                        respuestasPorMateria={respuestasDeEstaPregunta} 
                    />
                );
            case '3': 
                return (
                    <VistaActividadesDocentes 
                        pregunta={pregunta} 
                        respuestasPorMateria={respuestasDeEstaPregunta} 
                    />
                );
            case '4': 
                return (
                    <VistaDesempenoAuxiliares 
                        pregunta={pregunta} 
                        respuestasPorMateria={respuestasDeEstaPregunta} 
                    />
                );
            case '5': {
                const respuestaObjeto = Object.values(respuestasDeEstaPregunta)[0];
                let textoObservaciones: string = "—";
                
                if (respuestaObjeto?.texto_respuesta) {
                    try {
                        const parsed = JSON.parse(respuestaObjeto.texto_respuesta);
                        const valor = parsed.observaciones_comentarios; 
                        textoObservaciones = valor || "—";
                    } catch (e) {
                        textoObservaciones = respuestaObjeto.texto_respuesta || "—";
                    }
                }

                return (
                    <div className="container mt-4">
                        <h5 className="text-dark mb-3">5. {pregunta.enunciado}</h5>
                        
                        <CampoTextArea
                            label={null}
                            value={textoObservaciones} 
                            isReadOnly={true}
                            onChange={() => {}}
                        />
                    </div>
                );
            }
            
            default:
                return (
                    <div className="alert alert-info container mt-4">
                        Vista de solo lectura no implementada para la pregunta: 
                        <strong className="d-block mt-1">{pregunta.cod} - {pregunta.enunciado}</strong>
                        <p className="mt-2 mb-0">Respuestas encontradas: {Object.keys(respuestasDeEstaPregunta).length}</p>
                    </div>
                );
        }
    };

    return renderComponente();
}