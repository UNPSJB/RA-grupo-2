import { useEffect, useState } from "react";
import type { Materia, Pregunta, Respuesta } from "../../../types/types";
import { CampoTextArea, CampoTexto } from "./Campos";

interface Tabla2BItem {
    materia: Materia; encuesta_B: string; encuesta_C: string; encuesta_D: string; encuesta_ET: string; encuesta_EP: string; juicio_valor: string;
}
interface Props {
    departamentoId: number; carreraId: number; pregunta: Pregunta; anio: number; periodo: string;
    manejarCambio?: (items: Respuesta[]) => void;
    notificarValidacion?: (valido: boolean) => void;
}

export default function Pregunta2B({ departamentoId, carreraId, pregunta, anio, periodo, manejarCambio, notificarValidacion }: Props) {
    const [itemsTabla, setItems] = useState<Tabla2BItem[]>([]);
    const [itemsOriginales, setItemsOriginales] = useState<Tabla2BItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!departamentoId || !carreraId) return;
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const res = await fetch(`http://127.0.0.1:8000/informes_sinteticos_completados/tabla_pregunta_2B/?id_dpto=${departamentoId}&id_carrera=${carreraId}&anio=${anio}&periodo=${periodo}`);
                if (!res.ok) throw new Error("Error fetch");
                const data = await res.json();
                
                setItems(data);
                setItemsOriginales(JSON.parse(JSON.stringify(data)));

                const respuestas = data.map((itm: any) => ({
                    pregunta_id: pregunta.id,
                    materia_id: itm.materia.id,
                    texto_respuesta: JSON.stringify(itm), 
                }));
                manejarCambio?.(respuestas);
            } catch (err) { console.error(err); } finally { setIsLoading(false); }
        };
        fetchData();
    }, [departamentoId, carreraId, anio, periodo, pregunta.id]);

    useEffect(() => {
        if (itemsTabla.length === 0) return;
        const hayError = itemsTabla.some((item, idx) => {
            const orig = itemsOriginales[idx];
            const campos: (keyof Tabla2BItem)[] = ["encuesta_B", "encuesta_C", "encuesta_D", "encuesta_ET", "encuesta_EP", "juicio_valor"];
            return campos.some( key => orig[key] !== "" && item[key] === "");
        });
        notificarValidacion?.(!hayError);
    }, [itemsTabla]);

    const handleChange = <K extends keyof Tabla2BItem>(index: number, field: K, value: Tabla2BItem[K]) => {
        const updated = [...itemsTabla];
        updated[index][field] = value;
        setItems(updated);
        
        const itm = updated[index];
        const respuesta = {
            pregunta_id: pregunta.id,
            materia_id: itm.materia.id,
            texto_respuesta: JSON.stringify({
                encuesta_B: itm.encuesta_B, encuesta_C: itm.encuesta_C, encuesta_D: itm.encuesta_D,
                encuesta_ET: itm.encuesta_ET, encuesta_EP: itm.encuesta_EP, juicio_valor: itm.juicio_valor
            }),
        };
        manejarCambio?.([respuesta]);
    };

    const isError = (idx: number, field: keyof Tabla2BItem) => {
        if (!itemsOriginales[idx]) return false;
        const orig = itemsOriginales[idx][field];
        const curr = itemsTabla[idx][field];
        if (typeof orig === 'string' && typeof curr === 'string') {
             return (orig !== "" && curr === "");
        }
        return false;
    };

    return (
        <div className="container mt-4">
            <h5 className="text-dark mb-3">{pregunta.enunciado}</h5>
            {isLoading ? <div>Cargando...</div> : (
                <div className="accordion" id="accordion2B">
                    {itemsTabla.map((itm, index) => (
                        <div className="accordion-item" key={index}>
                            <h2 className="accordion-header" id={`heading${index}`}>
                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${index}`}>
                                    {itm.materia.matricula} - {itm.materia.nombre}
                                </button>
                            </h2>
                            <div id={`collapse${index}`} className="accordion-collapse collapse" data-bs-parent="#accordion2B">
                                <div className="accordion-body">
                                    <div className="row g-3">
                                        <label className="form-label">Encuestas a Alumnos:</label>
                                        <CampoTexto label="Categoria B" value={itm.encuesta_B} onChange={(v) => handleChange(index, "encuesta_B", v)} error={isError(index, "encuesta_B")} />
                                        <CampoTexto label="Categoria C" value={itm.encuesta_C} onChange={(v) => handleChange(index, "encuesta_C", v)} error={isError(index, "encuesta_C")} />
                                        <CampoTexto label="Categoria D" value={itm.encuesta_D} onChange={(v) => handleChange(index, "encuesta_D", v)} error={isError(index, "encuesta_D")} />
                                        <CampoTexto label="Categoria ET" value={itm.encuesta_ET} onChange={(v) => handleChange(index, "encuesta_ET", v)} error={isError(index, "encuesta_ET")} />
                                        <CampoTexto label="Categoria EP" value={itm.encuesta_EP} onChange={(v) => handleChange(index, "encuesta_EP", v)} error={isError(index, "encuesta_EP")} />
                                        <CampoTextArea label="Juicio de valor" value={itm.juicio_valor} onChange={(v) => handleChange(index, "juicio_valor", v)} error={isError(index, "juicio_valor")} />
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