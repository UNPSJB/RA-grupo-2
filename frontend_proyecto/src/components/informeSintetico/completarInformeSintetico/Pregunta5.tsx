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
}

export default function ObservacionesComentarios({
    pregunta,
    manejarCambio,
}: Props) {
    const [contenido, setContenido] = useState<string>("");

    useEffect(() => {
        manejarCambio?.({
            pregunta_id: pregunta.id,
            texto_respuesta: JSON.stringify({ observaciones_comentarios: "" }),
        });
    }, [pregunta.id]); 

    const handleContentChange = (nuevoContenido: string) => {
        setContenido(nuevoContenido);

        // Serializamos el contenido
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
            <h5 className="text-dark mb-3">{pregunta.enunciado}</h5>
            <CampoTextArea
                label={null}
                value={contenido}
                onChange={handleContentChange}
            />
        </div>
    );
}