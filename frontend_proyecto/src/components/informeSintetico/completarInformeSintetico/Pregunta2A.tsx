import { useEffect, useState } from "react";
import type { Materia, Pregunta, Respuesta } from "../../../types/types";
import { CampoTextArea, CampoPorcentaje } from "./Campos";

interface TemasFetchItem { 
    materia: Materia;
    porcentaje_texto: string | null; 
    estrategias_texto: string | null; 
}
interface ContenidosItem { 
    materia: Materia; 
    codigo: string; 
    nombre: string; 
    porcentaje: number | null; 
    estrategias: string; }

interface ContenidosProps {
    id_dpto: number; id_carrera: number; anio: number; periodo: string; pregunta: Pregunta;
    manejarCambio?: (respuestas: Respuesta[]) => void;
    notificarValidacion?: (valido: boolean) => void; 
}

export default function ContenidosAlcanzados({ id_dpto, id_carrera, anio, periodo, pregunta, manejarCambio, notificarValidacion }: ContenidosProps) {
    const [items, setItems] = useState<ContenidosItem[]>([]);
    const [itemsOriginales, setItemsOriginales] = useState<ContenidosItem[]>([]); 
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!id_dpto || !id_carrera) return;
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const res = await fetch(`http://127.0.0.1:8000/informes_sinteticos_completados/temas-desarrollados/?id_dpto=${id_dpto}&id_carrera=${id_carrera}&anio=${anio}&periodo=${periodo}`);
                if (!res.ok) throw new Error("Error fetch");
                const data: TemasFetchItem[] = await res.json();

                const parseado = data.map((m) => ({
                    materia: m.materia,
                    codigo: m.materia.matricula || 'N/A',
                    nombre: m.materia.nombre,
                    porcentaje: parseFloat(m.porcentaje_texto || "") || null,
                    estrategias: m.estrategias_texto || ""
                }));
                
                setItems(parseado);
                setItemsOriginales(JSON.parse(JSON.stringify(parseado)));

                const respuestas = parseado.map((item) => ({
                    pregunta_id: pregunta.id,
                    materia_id: item.materia.id,
                    texto_respuesta: JSON.stringify({ porcentaje: item.porcentaje, estrategias: item.estrategias })
                }));
                manejarCambio?.(respuestas);
            } catch (err) { console.error(err); } finally { setIsLoading(false); }
        };
        fetchData();
    }, [id_dpto, id_carrera, anio, periodo, pregunta.id]);

    useEffect(() => {
        if (items.length === 0) return;
        const hayError = items.some((item, idx) => {
            const orig = itemsOriginales[idx];
            if (orig.porcentaje !== null && item.porcentaje === null) return true;
            if (orig.estrategias !== "" && item.estrategias === "") return true;
            return false;
        });
        notificarValidacion?.(!hayError);
    }, [items]);

    const handleChange = <K extends keyof ContenidosItem>(index: number, field: K, value: ContenidosItem[K]) => {
        const updated = [...items];
        updated[index][field] = value;
        setItems(updated);
        const item = updated[index];
        const respuesta = {
            pregunta_id: pregunta.id,
            materia_id: item.materia.id,
            texto_respuesta: JSON.stringify({ porcentaje: item.porcentaje, estrategias: item.estrategias })
        };
        manejarCambio?.([respuesta]);
    };

    const isError = (idx: number, field: keyof ContenidosItem) => {
        if (!itemsOriginales[idx]) return false;
        const orig = itemsOriginales[idx][field];
        const curr = items[idx][field];
        return (orig !== null && orig !== "") && (curr === null || curr === "");
    };

    return (
        <div className="container mt-4">
            <h5 className="text-dark fw-bold mb-3">Contenidos de la materia</h5>
            <p className="text-muted mb-3">{pregunta.enunciado}</p>
            {isLoading ? <div>Cargando...</div> : (
                <div className="accordion" id="accordionContenidos">
                    {items.map((item, index) => (
                        <div className="accordion-item" key={item.materia.id}>
                            <h2 className="accordion-header" id={`heading${index}`}>
                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${index}`}>
                                    {item.codigo} - {item.nombre}
                                </button>
                            </h2>
                            <div id={`collapse${index}`} className="accordion-collapse collapse" data-bs-parent="#accordionContenidos">
                                <div className="accordion-body">
                                    <div className="row g-3">
                                        <CampoPorcentaje label="Porcentual contenidos alcanzados (%)" value={item.porcentaje} onChange={(v) => handleChange(index, "porcentaje", v)} error={isError(index, "porcentaje")} />
                                        <CampoTextArea label="Estrategias propuestas" value={item.estrategias} onChange={(v) => handleChange(index, "estrategias", v)} error={isError(index, "estrategias")} />
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