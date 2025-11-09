import { useEffect, useState } from "react";

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

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const nuevoContenido = e.target.value;
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
            <h4 className="mb-3">{pregunta.enunciado}</h4>
            <textarea
                className="form-control"
                rows={12}
                placeholder="Escriba aquí las observaciones o comentarios generales del departamento..."
                value={contenido}
                onChange={handleChange}
            />
        </div>
    );
}