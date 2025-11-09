import { useEffect, useState } from "react";
import type { Materia } from "../../../types/types";

interface Pregunta {
    id: number;
    cod: string;
    enunciado: string;
}

interface Tabla2BItem {
    materia: Materia
    encuesta_B: string
    encuesta_C: string
    encuesta_D: string
    encuesta_ET: string
    encuesta_EP: string
    juicio_valor: string
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


export default function Pregunta2B({
    departamentoId,
    carreraId,
    pregunta,
    anio,
    periodo,
    manejarCambio
}: Props) {
    const [itemsTabla, setItems] = useState<Tabla2BItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!departamentoId) return;
        if (!carreraId) return;
        console.log(pregunta)

        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const res = await fetch(
                    `http://127.0.0.1:8000/informes_sinteticos_completados/tabla_pregunta_2B/?id_dpto=${departamentoId}&id_carrera=${carreraId}&anio=${anio}&periodo=${periodo}`
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
                        encuesta_B: itm.encuesta_B,
                        encuesta_C: itm.encuesta_C,
                        encuesta_D: itm.encuesta_D,
                        encuesta_ET: itm.encuesta_ET,
                        encuesta_EP: itm.encuesta_EP,
                        juicio_valor: itm.juicio_valor,
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

    // Actualizo el estado local y notifica al padre
    const handleChange = <K extends keyof Tabla2BItem>(
        index: number,
        field: K,
        value: Tabla2BItem[K]
    ) => {
        const updated = [...itemsTabla];
        updated[index][field] = value;
        setItems(updated);

        // ✅ Siempre incluir pregunta_id explícitamente
        const respuestas: Respuesta[] = updated.map((itm) => ({
            pregunta_id: pregunta.id, // <-- aseguramos que nunca se pierda
            texto_respuesta: JSON.stringify({
                encuesta_B: itm.encuesta_B,
                encuesta_C: itm.encuesta_C,
                encuesta_D: itm.encuesta_D,
                encuesta_ET: itm.encuesta_ET,
                encuesta_EP: itm.encuesta_EP,
                juicio_valor: itm.juicio_valor,
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
                    <div className="accordion" id="accordionMateriasPregunta2B">
                        {itemsTabla.map((itm, index) => (
                            <div className="accordion-item" key={index}>
                                <h2 className="accordion-header" id={`heading${index}`}>
                                    <button
                                        className="accordion-button collapsed"
                                        type="button"
                                        data-bs-toggle="collapse"
                                        data-bs-target={`#collapse${index}`}
                                        aria-expanded="false"
                                        aria-controls={`collapse${index}`}
                                    >
                                        {itm.materia.nombre}
                                    </button>
                                </h2>
                                <div
                                    id={`collapse${index}`}
                                    className="accordion-collapse collapse"
                                    aria-labelledby={`heading${index}`}
                                    data-bs-parent="#accordionMateriasPregunta2B"
                                >
                                    <div className="accordion-body">
                                        <div className="row g-3">
                                            <CampoTexto label="Código" value={itm.materia.matricula} readOnly />
                                            <CampoTexto label="Nombre" value={itm.materia.nombre} readOnly />
                                            <CampoTexto
                                                label="Encuesta a alumnos: Categoria B"
                                                value={itm.encuesta_B}
                                                onChange={(v) =>
                                                    handleChange(index, "encuesta_B", v)
                                                }
                                            />

                                            <CampoTexto
                                                label="Encuesta a alumnos: Categoria C"
                                                value={itm.encuesta_C}
                                                onChange={(v) =>
                                                    handleChange(index, "encuesta_C", v)
                                                }
                                            />

                                            <CampoTexto
                                                label="Encuesta a alumnos: Categoria D"
                                                value={itm.encuesta_D}
                                                onChange={(v) =>
                                                    handleChange(index, "encuesta_D", v)
                                                }
                                            />

                                            <CampoTexto
                                                label="Encuesta a alumnos: Categoria ET"
                                                value={itm.encuesta_ET}
                                                onChange={(v) =>
                                                    handleChange(index, "encuesta_ET", v)
                                                }
                                            />

                                            <CampoTexto
                                                label="Encuesta a alumnos: Categoria EP"
                                                value={itm.encuesta_EP}
                                                onChange={(v) =>
                                                    handleChange(index, "encuesta_EP", v)
                                                }
                                            />

                                            <CampoTexto
                                                label="Juicio de valor"
                                                value={itm.juicio_valor}
                                                onChange={(v) =>
                                                    handleChange(index, "juicio_valor", v)
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
