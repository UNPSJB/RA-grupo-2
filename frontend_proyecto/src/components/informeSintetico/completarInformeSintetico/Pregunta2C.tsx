import { useEffect, useState } from "react";
import type { Materia, Pregunta, Respuesta } from "../../../types/types";
import { CampoTextArea } from "./Campos";

interface RespuestasSeccion2C {
    aspectos_positivos_ensenanza: string | null;
    aspectos_positivos_aprendizaje: string | null;
    obstaculos_ensenanza: string | null;
    obstaculos_aprendizaje: string | null;
    estrategias: string | null;
}
interface TablaPregunta2CItem { materia: Materia; respuestas: RespuestasSeccion2C; }
interface Props {
    departamentoId: number; carreraId: number; pregunta: Pregunta; anio: number; periodo: string;
    manejarCambio?: (items: Respuesta[]) => void;
    notificarValidacion?: (valido: boolean) => void;
}

export default function Pregunta2C({departamentoId, carreraId, pregunta, anio, periodo, manejarCambio, notificarValidacion}: Props) {
    const [itemsTabla, setItems] = useState<TablaPregunta2CItem[]>([]);
    const [itemsOriginales, setItemsOriginales] = useState<TablaPregunta2CItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!departamentoId || !carreraId) return;
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const res = await fetch(`http://127.0.0.1:8000/informes_sinteticos_completados/tabla_pregunta_2C/?id_dpto=${departamentoId}&id_carrera=${carreraId}&anio=${anio}&periodo=${periodo}`);
                if (!res.ok) throw new Error("Error fetch");
                const data = await res.json();
                
                setItems(data);
                setItemsOriginales(JSON.parse(JSON.stringify(data))); // Memoria

                const respuestas = data.map((itm: any) => ({
                    pregunta_id: pregunta.id,
                    materia_id: itm.materia.id,
                    texto_respuesta: JSON.stringify(itm.respuestas),
                }));
                manejarCambio?.(respuestas);
            } catch (err) { console.error(err); } finally { setIsLoading(false); }
        };
        fetchData();
    }, [departamentoId, carreraId, anio, periodo, pregunta.id]);

    // VALIDACIÓN
    useEffect(() => {
        if (itemsTabla.length === 0) return;
        const hayError = itemsTabla.some((item, idx) => {
            const orig = itemsOriginales[idx].respuestas;
            const curr = item.respuestas;
            const keys = Object.keys(orig) as (keyof RespuestasSeccion2C)[];
            
            return keys.some(key => {
                const vOrig = orig[key];
                const vCurr = curr[key];
                // Error si antes había texto y ahora está vacío (null o "")
                return (vOrig !== null && vOrig !== "") && (vCurr === null || vCurr === "");
            });
        });
        notificarValidacion?.(!hayError);
    }, [itemsTabla]);

    const handleChange = (index: number, field: keyof RespuestasSeccion2C, value: string | null) => {
        const updated = [...itemsTabla];
        updated[index].respuestas[field] = value;
        setItems(updated);
        
        const itm = updated[index];
        const respuesta = {
            pregunta_id: pregunta.id,
            materia_id: itm.materia.id,
            texto_respuesta: JSON.stringify(itm.respuestas),
        };
        manejarCambio?.([respuesta]);
    };

    const isError = (idx: number, field: keyof RespuestasSeccion2C) => {
        if (!itemsOriginales[idx]) return false;
        const orig = itemsOriginales[idx].respuestas[field];
        const curr = itemsTabla[idx].respuestas[field];
        return (orig !== null && orig !== "") && (curr === null || curr === "");
    };

    return (
        <div className="container mt-4">
            <h5 className="text-dark mb-3">{pregunta.enunciado}</h5>
            {isLoading ? <div>Cargando...</div> : (
                <div className="accordion" id="accordion2C">
                    {itemsTabla.map((itm, index) => (
                        <div className="accordion-item" key={itm.materia.id}>
                            <h2 className="accordion-header" id={`heading${index}`}>
                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${index}`}>
                                    {itm.materia.matricula} - {itm.materia.nombre}
                                </button>
                            </h2>
                            <div id={`collapse${index}`} className="accordion-collapse collapse" data-bs-parent="#accordion2C">
                                <div className="accordion-body">
                                    <div className="row g-3">
                                        <CampoTextArea label="Aspectos positivos: Enseñanza" value={itm.respuestas.aspectos_positivos_ensenanza || ''} onChange={(v) => handleChange(index, "aspectos_positivos_ensenanza", v)} error={isError(index, "aspectos_positivos_ensenanza")} />
                                        <CampoTextArea label="Aspectos positivos: Aprendizaje" value={itm.respuestas.aspectos_positivos_aprendizaje || ''} onChange={(v) => handleChange(index, "aspectos_positivos_aprendizaje", v)} error={isError(index, "aspectos_positivos_aprendizaje")} />
                                        <CampoTextArea label="Obstáculos: Enseñanza" value={itm.respuestas.obstaculos_ensenanza || ''} onChange={(v) => handleChange(index, "obstaculos_ensenanza", v)} error={isError(index, "obstaculos_ensenanza")} />
                                        <CampoTextArea label="Obstáculos: Aprendizaje" value={itm.respuestas.obstaculos_aprendizaje || ''} onChange={(v) => handleChange(index, "obstaculos_aprendizaje", v)} error={isError(index, "obstaculos_aprendizaje")} />
                                        <CampoTextArea label="Estrategias" value={itm.respuestas.estrategias || ''} onChange={(v) => handleChange(index, "estrategias", v)} error={isError(index, "estrategias")} />
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