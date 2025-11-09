import { useEffect, useState } from "react";
import type { Materia } from "../../../types/types";

interface Pregunta {
    id: number;
    cod: string;
    enunciado: string;
}

interface RespuestasSeccion2C {
    aspectos_positivos_ensenanza: string | null;
    aspectos_positivos_aprendizaje: string | null;
    obstaculos_ensenanza: string | null;
    obstaculos_aprendizaje: string | null;
    estrategias: string | null;
}

interface TablaPregunta2CItem {
    materia: Materia;
    respuestas: RespuestasSeccion2C;
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

export default function Pregunta2C({departamentoId, carreraId, pregunta, anio, periodo, manejarCambio}: Props) {
    const [itemsTabla, setItems] = useState<TablaPregunta2CItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!departamentoId || !carreraId) return;

        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const res = await fetch(
                    `http://127.0.0.1:8000/informes_sinteticos_completados/tabla_pregunta_2C/?id_dpto=${departamentoId}&id_carrera=${carreraId}&anio=${anio}&periodo=${periodo}`
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
                    texto_respuesta: JSON.stringify(itm.respuestas), 
                    materia_id: itm.materia.id,
                }));
                manejarCambio?.(respuestasIniciales);

            } catch (err) {
                console.error("Error al obtener información (Pregunta 2C):", err);
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

    const handleChange = (
        index: number,
        field: keyof RespuestasSeccion2C, 
        value: string | null
    ) => {
        const updated = [...itemsTabla];
        updated[index].respuestas[field] = value;
        setItems(updated);

        const respuestas: Respuesta[] = updated.map((itm) => ({
            pregunta_id: pregunta.id,
            texto_respuesta: JSON.stringify(itm.respuestas),
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
                    <div className="accordion" id="accordionMateriasPregunta2C">
                        {itemsTabla.map((itm, index) => (
                            <div className="accordion-item" key={itm.materia.id}>
                                <h2 className="accordion-header" id={`headingP2C_${index}`}>
                                    <button
                                        className="accordion-button collapsed"
                                        type="button"
                                        data-bs-toggle="collapse"
                                        data-bs-target={`#collapseP2C_${index}`}
                                        aria-expanded="false"
                                        aria-controls={`collapseP2C_${index}`}
                                    >
                                        {itm.materia.matricula} - {itm.materia.nombre}
                                    </button>
                                </h2>
                                <div
                                    id={`collapseP2C_${index}`}
                                    className="accordion-collapse collapse"
                                    aria-labelledby={`headingP2C_${index}`}
                                    data-bs-parent="#accordionMateriasPregunta2C"
                                >
                                    <div className="accordion-body">
                                        <div className="row g-3">
                                            <CampoTextArea
                                                label="Aspectos positivos: Proceso Enseñanza"
                                                value={itm.respuestas.aspectos_positivos_ensenanza || ''}
                                                onChange={(v) =>
                                                    handleChange(index, "aspectos_positivos_ensenanza", v)
                                                }
                                            />
                                            <CampoTextArea
                                                label="Aspectos positivos: Proceso de aprendizaje"
                                                value={itm.respuestas.aspectos_positivos_aprendizaje || ''}
                                                onChange={(v) =>
                                                    handleChange(index, "aspectos_positivos_aprendizaje", v)
                                                }
                                            />
                                            <CampoTextArea
                                                label="Obstáculos: Proceso Enseñanza"
                                                value={itm.respuestas.obstaculos_ensenanza || ''}
                                                onChange={(v) =>
                                                    handleChange(index, "obstaculos_ensenanza", v)
                                                }
                                            />
                                            <CampoTextArea
                                                label="Obstáculos: Proceso de aprendizaje"
                                                value={itm.respuestas.obstaculos_aprendizaje || ''}
                                                onChange={(v) =>
                                                    handleChange(index, "obstaculos_aprendizaje", v)
                                                }
                                            />
                                            <CampoTextArea
                                                label="Estrategias a implementar"
                                                value={itm.respuestas.estrategias || ''}
                                                onChange={(v) =>
                                                    handleChange(index, "estrategias", v)
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
}: {
    label: string;
    value: string;
    readOnly?: boolean;
}) {
    return (
        <div className="col-md-6">
            <label className="form-label">{label}</label>
            <input
                type="text"
                className="form-control"
                value={value}
                readOnly={readOnly}
            />
        </div>
    );
}

function CampoTextArea({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange?: (v: string) => void;
}) {
    return (
        <div className="col-12">
            <label className="form-label">{label}</label>
            <textarea
                className="form-control"
                rows={4}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
            />
        </div>
    );
}