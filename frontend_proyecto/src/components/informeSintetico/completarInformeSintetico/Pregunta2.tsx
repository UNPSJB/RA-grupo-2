import { useEffect, useState } from "react";
import type { Materia, Pregunta, Respuesta } from "../../../types/types";
import { CampoTextArea, CampoPorcentaje } from "./Campos";

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

    useEffect(() => {
        console.log("➡️ Iniciando useEffect con:", { 
            departamentoId, 
            carreraId, 
            anio, 
            periodo,
            preguntaId: pregunta.id
        }); 

        if (!departamentoId || !carreraId) {
            console.log("❌ Datos esenciales faltantes. Fetch cancelado.");
            return;
        }

        const fetchData = async () => {
            try {
                setIsLoading(true);
                const res = await fetch(
                    `http://127.0.0.1:8000/informes_sinteticos_completados/tabla_pregunta_2/?id_dpto=${departamentoId}&id_carrera=${carreraId}&anio=${anio}&periodo=${periodo}`
                );

                const data = await res.json();
               if (!res.ok) {
                    throw new Error(`Error en la respuesta HTTP: ${res.status} ${res.statusText}`);
                }
                
                const parseado: TablaPregunta2Item[] = data.map((itm: any) => ({
                    materia: itm.materia,
                    porcentaje_teoricas: parseFloat(itm.porcentaje_teoricas) || null,
                    porcentaje_practicas: parseFloat(itm.porcentaje_practicas) || null,
                    justificacion: itm.justificacion || "",
                }));

                setItems(parseado);
                setItemsOriginales(JSON.parse(JSON.stringify(parseado)));

                const respuestas = parseado.map((itm) => ({
                    pregunta_id: pregunta.id,
                    materia_id: itm.materia.id,
                    texto_respuesta: JSON.stringify({
                        porcentaje_teoricas: itm.porcentaje_teoricas,
                        porcentaje_practicas: itm.porcentaje_practicas,
                        justificacion: itm.justificacion,
                    }),
                }));

                manejarCambio?.(respuestas);

            } catch (err) { 
                console.error("Error en la carga de datos:", err); 
            } finally { 
                setIsLoading(false); 
            }
        };

        fetchData();
    }, [departamentoId, carreraId, anio, periodo, pregunta.id]);


    useEffect(() => {
        if (itemsTabla.length === 0) return;
        
        const hayError = itemsTabla.some((item, idx) => {
            const orig = itemsOriginales[idx];
            if (!orig) return false;
        
            const origTeoricas = orig.porcentaje_teoricas || 0;
            const currTeoricas = item.porcentaje_teoricas || 0;
            if (origTeoricas > 0 && currTeoricas === 0) return true;

            const origPracticas = orig.porcentaje_practicas || 0;
            const currPracticas = item.porcentaje_practicas || 0;
            if (origPracticas > 0 && currPracticas === 0) return true;
        
            if (orig.justificacion !== "" && item.justificacion === "") return true;
            
            return false;
        });
        
        notificarValidacion?.(!hayError);
    }, [itemsTabla]);

    const handleChange = <K extends keyof TablaPregunta2Item>(
        index: number, field: K, value: TablaPregunta2Item[K]
    ) => {
        const updated = [...itemsTabla];
        updated[index][field] = value;
        setItems(updated);

        const m = updated[index];
        const respuesta = {
            pregunta_id: pregunta.id,
            materia_id: m.materia.id,
            texto_respuesta: JSON.stringify({
                porcentaje_teoricas: m.porcentaje_teoricas,
                porcentaje_practicas: m.porcentaje_practicas,
                justificacion: m.justificacion,
            }),
        };
        manejarCambio?.([respuesta]);
    };


    const isError = (idx: number, field: keyof TablaPregunta2Item) => {
        if (!itemsOriginales[idx]) return false;
        const origVal = itemsOriginales[idx][field];
        const currVal = itemsTabla[idx][field];

        if (field === 'justificacion') {
            return (origVal !== "" && currVal === "");
        } else {
            const o = (origVal as number) || 0;
            const c = (currVal as number) || 0;
            return o > 0 && c === 0;
        }
    };

    return (
        <div className="container mt-4">
            <h5 className="text-dark mb-3">{pregunta.enunciado}</h5>
            {isLoading ? (
                <div className="text-center text-secondary">Cargando datos...</div>
            ) : itemsTabla.length === 0 ? (
                <div className="alert alert-warning">No hay respuestas.</div>
            ) : (
                <div className="accordion" id="accordionP2">
                    {itemsTabla.map((itm, index) => (
                        <div className="accordion-item" key={index}>
                            <h2 className="accordion-header" id={`headingP2_${index}`}>
                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#collapseP2_${index}`}>
                                    {itm.materia.matricula} - {itm.materia.nombre}
                                </button>
                            </h2>
                            <div id={`collapseP2_${index}`} className="accordion-collapse collapse" data-bs-parent="#accordionP2">
                                <div className="accordion-body">
                                    <div className="row g-3">
                                        <CampoPorcentaje 
                                            label="Porcentaje Clases Teóricas (%)" 
                                            value={itm.porcentaje_teoricas} 
                                            onChange={(v) => handleChange(index, "porcentaje_teoricas", v)} 
                                            error={isError(index, "porcentaje_teoricas")} 
                                        />
                                        <CampoPorcentaje 
                                            label="Porcentaje Clases Prácticas (%)" 
                                            value={itm.porcentaje_practicas} 
                                            onChange={(v) => handleChange(index, "porcentaje_practicas", v)} 
                                            error={isError(index, "porcentaje_practicas")} 
                                        />
                                        <CampoTextArea 
                                            label="Justificación" 
                                            value={itm.justificacion || ''} 
                                            onChange={(v) => handleChange(index, "justificacion", v)} 
                                            error={isError(index, "justificacion")} 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}