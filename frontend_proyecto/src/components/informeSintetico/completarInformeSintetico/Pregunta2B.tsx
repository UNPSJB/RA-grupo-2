import { useEffect, useState } from "react";
import type { Materia, Pregunta, Respuesta } from "../../../types/types";
import { CampoTextArea, CampoTexto } from "./Campos";

interface Tabla2BItem {
    materia: Materia
    encuesta_B: string
    encuesta_C: string
    encuesta_D: string
    encuesta_ET: string
    encuesta_EP: string
    juicio_valor: string
}

interface Props {
    departamentoId: number;
    carreraId: number;
    pregunta: Pregunta;
    anio: number;
    periodo: string;
    manejarCambio?: (items: Respuesta[]) => void;
    notificarValidacion?: (valido: boolean) => void; 
}


export default function Pregunta2B({
    departamentoId,
    carreraId,
    pregunta,
    anio,
    periodo,
    manejarCambio,
    notificarValidacion
}: Props) {
    const [itemsTabla, setItems] = useState<Tabla2BItem[]>([]);
    const [itemsOriginales, setItemsOriginales] = useState<Tabla2BItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!departamentoId || !carreraId) return;
        
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                notificarValidacion?.(false); // Bloqueo durante fetch

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


                const dataLimpia = data.map(item => ({
                    ...item,
                    encuesta_B: item.encuesta_B || "",
                    encuesta_C: item.encuesta_C || "",
                    encuesta_D: item.encuesta_D || "",
                    encuesta_ET: item.encuesta_ET || "",
                    encuesta_EP: item.encuesta_EP || "",
                    juicio_valor: item.juicio_valor || ""
                }));

                setItems(dataLimpia);
                setItemsOriginales(JSON.parse(JSON.stringify(dataLimpia)));
                
                const respuestasIniciales = dataLimpia.map((itm: Tabla2BItem) => ({
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

    useEffect(() => {
        if (isLoading) {
            notificarValidacion?.(false);
            return;
        }
        
        if (itemsTabla.length === 0 && !isLoading) {
            notificarValidacion?.(true);
            return;
        }

        const hayError = itemsTabla.some((item, idx) => {
            const original = itemsOriginales[idx];
            if (!original) return false;
            const check = (field: keyof Tabla2BItem) => {
                const valOriginal = original[field] as string;
                const valActual = item[field] as string;
                return valOriginal.trim() !== "" && valActual.trim() === "";
            };

            return check('encuesta_B') || check('encuesta_C') || check('encuesta_D') || 
                   check('encuesta_ET') || check('encuesta_EP') || check('juicio_valor');
        });

        notificarValidacion?.(!hayError);
    }, [itemsTabla, itemsOriginales, notificarValidacion, isLoading]);


    const handleChange = <K extends keyof Tabla2BItem>(
        index: number,
        field: K,
        value: Tabla2BItem[K]
    ) => {
        const updated = [...itemsTabla];
        updated[index][field] = value;
        setItems(updated);

        const respuestas: Respuesta[] = updated.map((itm) => ({
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

        manejarCambio?.(respuestas);
    };

 
    const isError = (idx: number, field: keyof Tabla2BItem) => {
        if (!itemsOriginales[idx]) return false;
        const valOriginal = itemsOriginales[idx][field] as string;
        const valActual = itemsTabla[idx][field] as string;
        return valOriginal.trim() !== "" && valActual.trim() === "";
    };

    return (
        <div className="container mt-4">
            <h5 className="text-dark fw-bold mb-3">Valoracion encuestas</h5>
            <p className="text-muted mb-3">{pregunta.enunciado}</p>
            {isLoading ? (
                <div className="text-center text-secondary">Cargando datos...</div>
            ) : error ? (
                <div className="alert alert-danger">
                    <strong>Error:</strong> {error}
                </div>
            ) : itemsTabla.length === 0 ? (
                <div className="alert alert-warning">
                    No hay materias para esta selección.
                </div>
            ) : (
                <>
                    <div className="accordion" id="accordionMateriasPregunta2B">
                        {itemsTabla.map((itm, index) => {
                            // Detectar si hay algún error en este acordeón para mostrar badge
                            const hasAnyError = 
                                isError(index, 'encuesta_B') || isError(index, 'encuesta_C') || 
                                isError(index, 'encuesta_D') || isError(index, 'encuesta_ET') || 
                                isError(index, 'encuesta_EP') || isError(index, 'juicio_valor');

                            return (
                                <div className="accordion-item" key={index}>
                                    <h2 className="accordion-header" id={`heading${index}`}>
                                        <button
                                            className={`accordion-button ${!hasAnyError ? 'collapsed' : ''}`}
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target={`#collapse${index}`}
                                            aria-expanded={hasAnyError}
                                            aria-controls={`collapse${index}`}
                                        >
                                            {itm.materia.matricula} - {itm.materia.nombre}
                                            {hasAnyError && <span className="badge bg-danger ms-2">!</span>}
                                        </button>
                                    </h2>
                                    <div
                                        id={`collapse${index}`}
                                        className={`accordion-collapse collapse ${hasAnyError ? 'show' : ''}`}
                                        aria-labelledby={`heading${index}`}
                                        data-bs-parent="#accordionMateriasPregunta2B"
                                    >
                                        <div className="accordion-body">
                                            <div className="row g-3">
                                                <div className="col-12"><label className="form-label fw-bold">Encuestas a Alumnos:</label></div>
                                                
                                                <CampoTexto
                                                    label="Categoria B"
                                                    value={itm.encuesta_B}
                                                    onChange={(v) => handleChange(index, "encuesta_B", v)}
                                                    error={isError(index, "encuesta_B")}
                                                />
                                                <CampoTexto
                                                    label="Categoria C"
                                                    value={itm.encuesta_C}
                                                    onChange={(v) => handleChange(index, "encuesta_C", v)}
                                                    error={isError(index, "encuesta_C")}
                                                />
                                                <CampoTexto
                                                    label="Categoria D"
                                                    value={itm.encuesta_D}
                                                    onChange={(v) => handleChange(index, "encuesta_D", v)}
                                                    error={isError(index, "encuesta_D")}
                                                />
                                                <CampoTexto
                                                    label="Categoria ET"
                                                    value={itm.encuesta_ET}
                                                    onChange={(v) => handleChange(index, "encuesta_ET", v)}
                                                    error={isError(index, "encuesta_ET")}
                                                />
                                                <CampoTexto
                                                    label="Categoria EP"
                                                    value={itm.encuesta_EP}
                                                    onChange={(v) => handleChange(index, "encuesta_EP", v)}
                                                    error={isError(index, "encuesta_EP")}
                                                />
                                                <CampoTextArea
                                                    label="Juicio de valor"
                                                    value={itm.juicio_valor}
                                                    onChange={(v) => handleChange(index, "juicio_valor", v)}
                                                    error={isError(index, "juicio_valor")}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}