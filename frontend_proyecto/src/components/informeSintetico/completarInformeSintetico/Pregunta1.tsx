import { useEffect, useState } from "react";
import type { Materia } from "../../../types/types";

// --- INTERFACES DEL FRONTEND ---

interface Pregunta {
    id: number;
    enunciado: string;
}

interface NecesidadesItem {
    materia: Materia;
    equipamiento: string;
    bibliografia: string;
    
}

interface Respuesta {
    pregunta_id: number;
    texto_respuesta: string;
    materia_id: number;
}

interface Props {
    departamentoId: number;
    carreraId: number;
    pregunta: Pregunta;
    anio: number;
    periodo: string;
    manejarCambio?: (items: Respuesta[]) => void;
}

// Tipo que define solo los campos editables (que son string)
type EditableFields = 'bibliografia' | 'equipamiento'; 

export default function EquipamientoBibliografia({
    departamentoId,
    carreraId,
    pregunta,
    anio,
    periodo,
    manejarCambio
}: Props) {
    const [itemsTabla, setItems] = useState<NecesidadesItem[]>([]); 
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!departamentoId || !carreraId || !anio || !periodo) return;

        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // LLAMADA AL ENDPOINT CREADO
                const res = await fetch(
                    `http://127.0.0.1:8000/informes_sinteticos_completados/bibliografia_equipamiento/?id_dpto=${departamentoId}&id_carrera=${carreraId}&anio=${anio}&periodo=${periodo}`
                );

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({ detail: res.statusText }));
                    throw new Error(`Error HTTP ${res.status}: ${errData.detail || res.statusText}`);
                }
                const data: NecesidadesItem[] = await res.json();
                
                if (!Array.isArray(data)) {
                    throw new Error("El formato de los datos recibidos no es válido.");
                }

                setItems(data);

                // Prepara las respuestas iniciales para el componente padre
                const respuestasIniciales: Respuesta[] = data.map((itm) => ({
                    pregunta_id: pregunta.id,
                    texto_respuesta: JSON.stringify({
                        bibliografia: itm.bibliografia,
                        equipamiento: itm.equipamiento,
                    }),
                    materia_id: itm.materia.id,
                }));
                manejarCambio?.(respuestasIniciales);

            } catch (err) {
                console.error("Error al obtener necesidades:", err);
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Error desconocido");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [departamentoId, carreraId, anio, periodo, pregunta.id]);


    // Maneja los cambios en los campos de texto y notifica al padre
    const handleChange = (
        index: number,
        field: EditableFields, // <-- Usa el tipo restringido aquí
        value: string // <-- El valor es siempre string
    ) => {
        const updated = [...itemsTabla];
        
        // Asignación segura
        updated[index][field] = value; 
        setItems(updated);

        // Prepara el array de respuestas para manejarCambio
        const respuestas: Respuesta[] = updated.map((itm) => ({
            pregunta_id: pregunta.id, 
            texto_respuesta: JSON.stringify({
                bibliografia: itm.bibliografia,
                equipamiento: itm.equipamiento,
            }),
            materia_id: itm.materia.id,
        }));

        manejarCambio?.(respuestas);
    };


    return (
        <div className="container mt-4">
            <h4 className="mb-3">{pregunta.enunciado}</h4>

            {isLoading ? (
                <div className="text-center text-secondary">Cargando datos...</div>
            ) : error ? (
                <div className="alert alert-danger">
                    <strong>Error:</strong> {error}
                </div>
            ) : itemsTabla.length === 0 ? (
                <div className="alert alert-warning">
                    No hay necesidades de equipamiento/bibliografía reportadas.
                </div>
            ) : (
                <>
                    <div className="accordion" id="accordionNecesidades">
                        {itemsTabla.map((itm, index) => (
                            <div className="accordion-item" key={index}>
                                <h2 className="accordion-header" id={`headingN${index}`}>
                                    <button
                                        className="accordion-button collapsed"
                                        type="button"
                                        data-bs-toggle="collapse"
                                        data-bs-target={`#collapseN${index}`}
                                        aria-expanded="false"
                                        aria-controls={`collapseN${index}`}
                                    >
                                        {itm.materia.nombre} ({itm.materia.matricula})
                                    </button>
                                </h2>
                                <div
                                    id={`collapseN${index}`}
                                    className="accordion-collapse collapse"
                                    aria-labelledby={`headingN${index}`}
                                    data-bs-parent="#accordionNecesidades"
                                >
                                    <div className="accordion-body">
                                        <div className="row g-3">
                                            {/* Mostrar la Bibliografía */}
                                            <CampoTexto
                                                label="Necesidad de Equipamiento"
                                                value={itm.equipamiento}
                                                // La clave debe ser 'bibliografia'
                                                onChange={(v) =>
                                                    handleChange(index, "equipamiento", v)
                                                }
                                            />

                                            {/* Mostrar el Equipamiento */}
                                            <CampoTexto
                                                label="Necesidad de Bibliografia"
                                                value={itm.bibliografia}
                                                // La clave debe ser 'equipamiento'
                                                onChange={(v) =>
                                                    handleChange(index, "bibliografia", v)
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

// Función auxiliar para renderizar campos de texto (reutilizada de tus otros archivos)
function CampoTexto({
    label,
    value,
    readOnly = false,
    onChange,
}: {
    label: string;
    value: string;
    readOnly?: boolean;
    onChange?: (v: string) => void;
}) {
    return (
        <div className="col-md-6">
            <label className="form-label">{label}</label>
            <textarea
                className="form-control"
                rows={3} // Usamos textarea para permitir respuestas largas
                value={value}
                readOnly={readOnly}
                onChange={(e) => onChange?.(e.target.value)}
            />
        </div>
    );
}