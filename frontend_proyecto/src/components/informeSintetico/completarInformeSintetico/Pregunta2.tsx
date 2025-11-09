import { useEffect, useState } from "react";
import type { Materia } from "../../../types/types";

interface Pregunta {
    id: number;
    cod: string;
    enunciado: string;
}

interface TablaPregunta2Item {
    materia: Materia;
    porcentaje_teoricas: string;
    porcentaje_practicas: string;
    justificacion: string | null;
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

export default function Pregunta2({
    departamentoId,
    carreraId,
    pregunta,
    anio,
    periodo,
    manejarCambio
}: Props) {
    const [itemsTabla, setItems] = useState<TablaPregunta2Item[]>([]); 
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!departamentoId) return;
        if (!carreraId) return;

        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const res = await fetch(
                    `http://127.0.0.1:8000/informes_sinteticos_completados/tabla_pregunta_2/?id_dpto=${departamentoId}&id_carrera=${carreraId}&anio=${anio}&periodo=${periodo}`
                );

                if (!res.ok) {
                    throw new Error(`Error HTTP ${res.status}: ${res.statusText}`);
                }
                const data = await res.json();
                if (!Array.isArray(data)) {
                    throw new Error("El formato de los datos recibidos no es válido.");
                }

                setItems(data);

                const respuestasIniciales = data.map((itm) => ({
                    pregunta_id: pregunta.id,
                    texto_respuesta: JSON.stringify({
                        porcentaje_teoricas: itm.porcentaje_teoricas,
                        porcentaje_practicas: itm.porcentaje_practicas,
                        justificacion: itm.justificacion,
                    }),
                    materia_id: itm.materia.id,
                }));
                manejarCambio?.(respuestasIniciales);

            } catch (err) {
                console.error("Error al obtener información:", err);
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

    const handleChange = <K extends keyof TablaPregunta2Item>(
        index: number,
        field: K,
        value: TablaPregunta2Item[K]
    ) => {
        const updated = [...itemsTabla];
        updated[index][field] = value;
        setItems(updated);

        const respuestas: Respuesta[] = updated.map((itm) => ({
            pregunta_id: pregunta.id, 
            texto_respuesta: JSON.stringify({
                porcentaje_teoricas: itm.porcentaje_teoricas,
                porcentaje_practicas: itm.porcentaje_practicas,
                justificacion: itm.justificacion,
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
                    No hay respuestas.
                </div>
            ) : (
                <>
                    <div className="accordion" id="accordionMateriasPregunta2">
                        {itemsTabla.map((itm, index) => (
                            <div className="accordion-item" key={index}>
                                <h2 className="accordion-header" id={`headingP2_${index}`}>
                                    <button
                                        className="accordion-button collapsed"
                                        type="button"
                                        data-bs-toggle="collapse"
                                        data-bs-target={`#collapseP2_${index}`}
                                        aria-expanded="false"
                                        aria-controls={`collapseP2_${index}`}
                                    >
                                        {itm.materia.nombre}
                                    </button>
                                </h2>
                                <div
                                    id={`collapseP2_${index}`}
                                    className="accordion-collapse collapse"
                                    aria-labelledby={`headingP2_${index}`}
                                    data-bs-parent="#accordionMateriasPregunta2"
                                >
                                    <div className="accordion-body">
                                        <div className="row g-3">
                                            <CampoTexto label="Código" value={itm.materia.matricula} readOnly />
                                            <CampoTexto label="Nombre" value={itm.materia.nombre} readOnly />
                                            
                                            <CampoTexto
                                                label="Porcentaje Clases Teóricas (%)"
                                                value={itm.porcentaje_teoricas}
                                                onChange={(v) =>
                                                    handleChange(index, "porcentaje_teoricas", v)
                                                }
                                            />

                                            <CampoTexto
                                                label="Porcentaje Clases Prácticas (%)"
                                                value={itm.porcentaje_practicas}
                                                onChange={(v) =>
                                                    handleChange(index, "porcentaje_practicas", v)
                                                }
                                            />

                                            <CampoTexto
                                                label="Justificación"
                                                value={itm.justificacion || ''}
                                                onChange={(v) =>
                                                    handleChange(index, "justificacion", v)
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
            <input
                type="text"
                className="form-control"
                value={value}
                readOnly={readOnly}
                onChange={(e) => onChange?.(e.target.value)}
            />
        </div>
    );
}