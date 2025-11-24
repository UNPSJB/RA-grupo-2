import { useEffect, useState } from "react";
import type { Materia, Pregunta, Respuesta } from "../../../types/types";
import { CampoTextArea } from "./Campos";
//instancia api
import api from "../../../services/api";

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

interface Props {
    departamentoId: number;
    carreraId: number;
    pregunta: Pregunta;
    anio: number;
    periodo: string;
    manejarCambio?: (items: Respuesta[]) => void;
    notificarValidacion?: (valido: boolean) => void; 
}

export default function Pregunta2C({
    departamentoId, 
    carreraId, 
    pregunta, 
    anio, 
    periodo, 
    manejarCambio,
    notificarValidacion 
}: Props) {
    const [itemsTabla, setItems] = useState<TablaPregunta2CItem[]>([]);
    const [itemsOriginales, setItemsOriginales] = useState<TablaPregunta2CItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        notificarValidacion?.(false);

        if (!departamentoId || !carreraId) return;

        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                notificarValidacion?.(false); // Bloqueo durante fetch

                const res = await api.get(
                    "/informes_sinteticos_completados/tabla_pregunta_2C/",
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
                if (!Array.isArray(data)) {
                    throw new Error("El formato de los datos recibidos no es válido.");
                }

                const dataLimpia = data.map((itm: any) => ({
                    materia: itm.materia,
                    respuestas: {
                        aspectos_positivos_ensenanza: itm.respuestas.aspectos_positivos_ensenanza || "",
                        aspectos_positivos_aprendizaje: itm.respuestas.aspectos_positivos_aprendizaje || "",
                        obstaculos_ensenanza: itm.respuestas.obstaculos_ensenanza || "",
                        obstaculos_aprendizaje: itm.respuestas.obstaculos_aprendizaje || "",
                        estrategias: itm.respuestas.estrategias || ""
                    }
                }));

                setItems(dataLimpia);
                setItemsOriginales(JSON.parse(JSON.stringify(dataLimpia)));

                const respuestasIniciales = dataLimpia.map((itm: TablaPregunta2CItem) => ({
                    pregunta_id: pregunta.id,
                    texto_respuesta: JSON.stringify(itm.respuestas), 
                    materia_id: itm.materia.id,
                }));
                manejarCambio?.(respuestasIniciales);

            } catch (err: any) {
                console.error("Error al obtener información (Pregunta 2C):", err);
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

            const check = (field: keyof RespuestasSeccion2C) => {
                const valOriginal = original.respuestas[field] || "";
                const valActual = item.respuestas[field] || "";
                return valOriginal.trim() !== "" && valActual.trim() === "";
            };

            return check('aspectos_positivos_ensenanza') || 
                   check('aspectos_positivos_aprendizaje') || 
                   check('obstaculos_ensenanza') || 
                   check('obstaculos_aprendizaje') || 
                   check('estrategias');
        });

        notificarValidacion?.(!hayError);
    }, [itemsTabla, itemsOriginales, notificarValidacion, isLoading]);


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

    const isError = (idx: number, field: keyof RespuestasSeccion2C) => {
        if (!itemsOriginales[idx]) return false;
        const valOriginal = itemsOriginales[idx].respuestas[field] || "";
        const valActual = itemsTabla[idx].respuestas[field] || "";
        return valOriginal.trim() !== "" && valActual.trim() === "";
    };

    return (
        <div className="container mt-4">
            <h5 className="text-dark fw-bold mb-3">Reflexion sobre el espacio curricular</h5>
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
                    <div className="accordion" id="accordionMateriasPregunta2C">
                        {itemsTabla.map((itm, index) => {
                             const hasAnyError = 
                                isError(index, 'aspectos_positivos_ensenanza') || 
                                isError(index, 'aspectos_positivos_aprendizaje') || 
                                isError(index, 'obstaculos_ensenanza') || 
                                isError(index, 'obstaculos_aprendizaje') || 
                                isError(index, 'estrategias');

                             return (
                                <div className="accordion-item" key={itm.materia.id}>
                                    <h2 className="accordion-header" id={`headingP2C_${index}`}>
                                        <button
                                            className={`accordion-button ${!hasAnyError ? 'collapsed' : ''}`}
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target={`#collapseP2C_${index}`}
                                            aria-expanded={hasAnyError}
                                            aria-controls={`collapseP2C_${index}`}
                                        >
                                            {itm.materia.matricula} - {itm.materia.nombre}
                                            {hasAnyError && <span className="badge bg-danger ms-2">!</span>}
                                        </button>
                                    </h2>
                                    <div
                                        id={`collapseP2C_${index}`}
                                        className={`accordion-collapse collapse ${hasAnyError ? 'show' : ''}`}
                                        aria-labelledby={`headingP2C_${index}`}
                                        data-bs-parent="#accordionMateriasPregunta2C"
                                    >
                                        <div className="accordion-body">
                                            <div className="row g-3">
                                                <CampoTextArea
                                                    label="Aspectos positivos: Proceso Enseñanza"
                                                    value={itm.respuestas.aspectos_positivos_ensenanza || ''}
                                                    onChange={(v) => handleChange(index, "aspectos_positivos_ensenanza", v)}
                                                    error={isError(index, "aspectos_positivos_ensenanza")}
                                                />
                                                <CampoTextArea
                                                    label="Aspectos positivos: Proceso de aprendizaje"
                                                    value={itm.respuestas.aspectos_positivos_aprendizaje || ''}
                                                    onChange={(v) => handleChange(index, "aspectos_positivos_aprendizaje", v)}
                                                    error={isError(index, "aspectos_positivos_aprendizaje")}
                                                />
                                                <CampoTextArea
                                                    label="Obstáculos: Proceso Enseñanza"
                                                    value={itm.respuestas.obstaculos_ensenanza || ''}
                                                    onChange={(v) => handleChange(index, "obstaculos_ensenanza", v)}
                                                    error={isError(index, "obstaculos_ensenanza")}
                                                />
                                                <CampoTextArea
                                                    label="Obstáculos: Proceso de aprendizaje"
                                                    value={itm.respuestas.obstaculos_aprendizaje || ''}
                                                    onChange={(v) => handleChange(index, "obstaculos_aprendizaje", v)}
                                                    error={isError(index, "obstaculos_aprendizaje")}
                                                />
                                                <CampoTextArea
                                                    label="Estrategias a implementar"
                                                    value={itm.respuestas.estrategias || ''}
                                                    onChange={(v) => handleChange(index, "estrategias", v)}
                                                    error={isError(index, "estrategias")}
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