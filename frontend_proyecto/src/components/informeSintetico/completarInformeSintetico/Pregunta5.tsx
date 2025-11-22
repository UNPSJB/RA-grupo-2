import { useEffect, useState } from "react";
import { CampoTextArea } from "./Campos"; 

interface Pregunta {
    id: number;
    enunciado: string;
}

interface Respuesta {
    pregunta_id: number;
    texto_respuesta: string;
    materia_id?: number; 
}

interface Props {
    pregunta: Pregunta;
    manejarCambio?: (respuesta: Respuesta[] | Respuesta) => void;
    notificarValidacion?: (valido: boolean) => void;
}

export default function ObservacionesComentarios({
    pregunta,
    manejarCambio,
    notificarValidacion
}: Props) {
    const [contenido, setContenido] = useState<string>("");

    useEffect(() => {
        manejarCambio?.({
            pregunta_id: pregunta.id,
            texto_respuesta: JSON.stringify({ observaciones_comentarios: "" }),
        });
        
        notificarValidacion?.(false);
        
    }, [pregunta.id]); 


    useEffect(() => {
        const esValido = contenido.trim() !== "";
        notificarValidacion?.(esValido);
    }, [contenido, notificarValidacion]);

    const handleContentChange = (nuevoContenido: string) => {
        setContenido(nuevoContenido);

        const respuestaSerializada = JSON.stringify({
            observaciones_comentarios: nuevoContenido
        });

        manejarCambio?.({
            pregunta_id: pregunta.id,
            texto_respuesta: respuestaSerializada, 
            materia_id: undefined 
        });
};

    return (
        <div className="container mt-4">
            <h5 className="text-dark fw-bold mb-3">Observaciones</h5>
            <p className="text-muted mb-3">{pregunta.enunciado}</p>
            
            <CampoTextArea
                label={null}
                value={contenido}
                onChange={handleContentChange}
                error={contenido.trim() === ""}
            />
        </div>
    );
}