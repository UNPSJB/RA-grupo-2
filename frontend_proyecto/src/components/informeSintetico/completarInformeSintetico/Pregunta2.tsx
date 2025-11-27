import { useEffect, useState } from "react";
import type { Materia, Pregunta, Respuesta } from "../../../types/types";
import { CampoTextArea, CampoPorcentaje } from "./Campos";

//instancia api
import api from "../../../services/api";

interface TablaPregunta2Item {
    materia: Materia;
    porcentaje_teoricas: number | null;
    porcentaje_practicas: number | null;
    justificacion: string | null;
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

export default function Pregunta2({
    departamentoId,
    carreraId,
    pregunta,
    anio,
    periodo,
    manejarCambio,
    notificarValidacion
}: Props) {
    const [itemsTabla, setItems] = useState<TablaPregunta2Item[]>([]);
    const [itemsOriginales, setItemsOriginales] = useState<TablaPregunta2Item[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        notificarValidacion?.(false);
        
        if (!departamentoId || !carreraId) return;

        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                notificarValidacion?.(false); 

                const res = await api.get(
                    "/informes_sinteticos_completados/tabla_pregunta_2/", 
                    {
                        params: {
                            id_dpto: departamentoId,
                            id_carrera: carreraId,
                            anio: anio,
                            periodo: periodo
                        }
                    }
                );
                const data = res.data;
                if (!Array.isArray(data)) throw new Error("Formato inválido");

                const itemsIniciales: TablaPregunta2Item[] = data.map((itm: any) => ({
                    materia: itm.materia,
                    porcentaje_teoricas: itm.porcentaje_teoricas ? parseFloat(itm.porcentaje_teoricas) : null,
                    porcentaje_practicas: itm.porcentaje_practicas ? parseFloat(itm.porcentaje_practicas) : null,
                    justificacion: itm.justificacion || "",
                }));

                setItems(itemsIniciales);
                setItemsOriginales(JSON.parse(JSON.stringify(itemsIniciales)));

                const respuestasIniciales = data.map((itm: any) => ({
                    pregunta_id: pregunta.id,
                    texto_respuesta: JSON.stringify({
                        porcentaje_teoricas: itm.porcentaje_teoricas,
                        porcentaje_practicas: itm.porcentaje_practicas,
                        justificacion: itm.justificacion,
                    }),
                    materia_id: itm.materia.id,
                }));
                manejarCambio?.(respuestasIniciales);

            } catch (err: any) {
                console.error("Error al obtener información:", err);
                const errorMsg = err.response?.data?.detail || err.message || "Error desconocido";
                setError(errorMsg);
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
            const errorTeoricas = original.porcentaje_teoricas !== null && item.porcentaje_teoricas === null;
            const errorPracticas = original.porcentaje_practicas !== null && item.porcentaje_practicas === null;
            return errorTeoricas || errorPracticas;
        });
        
        notificarValidacion?.(!hayError);
    }, [itemsTabla, itemsOriginales, notificarValidacion, isLoading]);

    const reportarCambios = (items: TablaPregunta2Item[]) => {
        const respuestas: Respuesta[] = items.map((itm) => ({
            pregunta_id: pregunta.id, 
            texto_respuesta: JSON.stringify({
                porcentaje_teoricas: itm.porcentaje_teoricas,
                porcentaje_practicas: itm.porcentaje_practicas,
                justificacion: itm.justificacion,
            }),
            materia_id: itm.materia.id,
        }));
        manejarCambio?.(respuestas);
    }

    const handleChange = <K extends keyof TablaPregunta2Item>(
        index: number,
        field: K,
        value: TablaPregunta2Item[K]
    ) => {
        const updated = [...itemsTabla];
        updated[index][field] = value;
        setItems(updated);
        reportarCambios(updated);
    };
    const checkError = (idx: number, field: 'teoricas' | 'practicas') => {
        if (!itemsOriginales[idx]) return false;
        const original = itemsOriginales[idx];
        const current = itemsTabla[idx];

        if (field === 'teoricas') {
            return original.porcentaje_teoricas !== null && current.porcentaje_teoricas === null;
        }
        if (field === 'practicas') {
            return original.porcentaje_practicas !== null && current.porcentaje_practicas === null;
        }
        return false;
    };

    return (
        <div className="container mt-4">
            <h5 className="text-dark fw-bold mb-3">Horas de clases</h5>
            <p className="text-muted mb-3">{pregunta.enunciado}</p>

            {isLoading ? (
                <div className="text-center text-secondary">Cargando...</div>
            ) : error ? (
                <div className="alert alert-danger">{error}</div>
            ) : itemsTabla.length === 0 ? (
                <div className="alert alert-warning">No hay materias.</div>
            ) : (
                <div className="accordion" id="accordionMateriasPregunta2">
                    {itemsTabla.map((itm, index) => {
                        const hasError = checkError(index, 'teoricas') || checkError(index, 'practicas');
                        
                        return (
                            <div className="accordion-item" key={index}>
                                <h2 className="accordion-header" id={`headingP2_${index}`}>
                                    <button
                                        className={`accordion-button ${!hasError ? 'collapsed' : ''}`}
                                        type="button"
                                        data-bs-toggle="collapse"
                                        data-bs-target={`#collapseP2_${index}`}
                                        aria-expanded={hasError}
                                        aria-controls={`collapseP2_${index}`}
                                    >
                                        {itm.materia.matricula} - {itm.materia.nombre}
                                        {hasError && <span className="badge bg-danger ms-2">!</span>}
                                    </button>
                                </h2>
                                <div
                                    id={`collapseP2_${index}`}
                                    className={`accordion-collapse collapse ${hasError ? 'show' : ''}`}
                                    aria-labelledby={`headingP2_${index}`}
                                    data-bs-parent="#accordionMateriasPregunta2"
                                >
                                    <div className="accordion-body">
                                        <div className="row g-3">
                                            <CampoPorcentaje
                                                label="Porcentaje Clases Teóricas (%)"
                                                value={itm.porcentaje_teoricas}
                                                onChange={(v) => handleChange(index, "porcentaje_teoricas", v)}
                                                error={checkError(index, 'teoricas')}
                                            />
                                            <CampoPorcentaje
                                                label="Porcentaje Clases Prácticas (%)"
                                                value={itm.porcentaje_practicas}
                                                onChange={(v) => handleChange(index, "porcentaje_practicas", v)}
                                                error={checkError(index, 'practicas')}
                                            />
                                            <CampoTextArea
                                                label="Justificación"
                                                value={itm.justificacion || ''}
                                                onChange={(v) => handleChange(index, "justificacion", v)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}