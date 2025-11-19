import { useEffect, useState } from "react";
import type { Materia, Pregunta, Respuesta } from "../../../types/types";

interface NecesidadesItem { materia: Materia; equipamiento: string; bibliografia: string; }
interface NecesidadesEstado { materia: Materia; equipamiento: string[]; bibliografia: string[]; }
interface Props { 
    departamentoId: number; carreraId: number; pregunta: Pregunta; anio: number; periodo: string; 
    manejarCambio?: (items: Respuesta[]) => void;
    notificarValidacion?: (valido: boolean) => void; 
}
type EditableFields = 'bibliografia' | 'equipamiento';

export default function EquipamientoBibliografia({ departamentoId, carreraId, pregunta, anio, periodo, manejarCambio, notificarValidacion }: Props) {
    const [itemsTabla, setItems] = useState<NecesidadesEstado[]>([]);
    const [itemsOriginales, setItemsOriginales] = useState<NecesidadesEstado[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!departamentoId || !carreraId || !anio || !periodo) return;
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const res = await fetch(`http://127.0.0.1:8000/informes_sinteticos_completados/bibliografia_equipamiento/?id_dpto=${departamentoId}&id_carrera=${carreraId}&anio=${anio}&periodo=${periodo}`);
                if (!res.ok) throw new Error("Error fetch");
                const data: NecesidadesItem[] = await res.json();
                
                const separar = (s: string) => (!s || s === '-') ? [] : s.split('\n').filter(l => l.trim() !== '');

                const dataParseada = data.map(item => ({
                    materia: item.materia,
                    equipamiento: separar(item.equipamiento),
                    bibliografia: separar(item.bibliografia),
                }));
                
                setItems(dataParseada);
                setItemsOriginales(JSON.parse(JSON.stringify(dataParseada)));

                const respuestas = dataParseada.map((itm) => ({
                    pregunta_id: pregunta.id,
                    materia_id: itm.materia.id,
                    texto_respuesta: JSON.stringify({
                        bibliografia: itm.bibliografia.join('\n'),
                        equipamiento: itm.equipamiento.join('\n'),
                    }),
                }));
                manejarCambio?.(respuestas);
            } catch (error) { setError("Error cargando datos"); } 
            finally { setIsLoading(false); }
        };
        fetchData();
    }, [departamentoId, carreraId, anio, periodo, pregunta.id]);

    useEffect(() => {
        if (itemsTabla.length === 0) return;
        
        const hayError = itemsTabla.some((item, idx) => {
            const original = itemsOriginales[idx];
            
            const errorEquip = original.equipamiento.length > 0 && item.equipamiento.length === 0;
            const errorBiblio = original.bibliografia.length > 0 && item.bibliografia.length === 0;
            
            const errorTextoEquip = item.equipamiento.some(t => t.trim() === "");
            const errorTextoBiblio = item.bibliografia.some(t => t.trim() === "");

            return errorEquip || errorBiblio || errorTextoEquip || errorTextoBiblio;
        });

        notificarValidacion?.(!hayError);
    }, [itemsTabla]);

    const handleArrayChange = (mIndex: number, field: EditableFields, val: string, aIndex: number) => {
        const updated = [...itemsTabla];
        updated[mIndex][field][aIndex] = val;
        setItems(updated);
        
         const respuestas = updated.map((itm) => ({
            pregunta_id: pregunta.id,
            materia_id: itm.materia.id,
            texto_respuesta: JSON.stringify({
                bibliografia: itm.bibliografia.join('\n'),
                equipamiento: itm.equipamiento.join('\n'),
            }),
        }));
        manejarCambio?.(respuestas);
    };

    return (
        <div className="container mt-4">
            <h5 className="text-dark fw-bold mb-3">Equipamiento y Bibliografía</h5>
            <p className="text-muted mb-3">{pregunta.enunciado}</p>
<<<<<<< .mine
            {isLoading ? <div>Cargando...</div> : (











=======

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
>>>>>>> .theirs
                <div className="accordion" id="accordionNecesidades">
                    {itemsTabla.map((itm, index) => (
                        <div className="accordion-item" key={index}>
                            <h2 className="accordion-header" id={`headingN${index}`}>
                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#collapseN${index}`}>
                                    {itm.materia.nombre} ({itm.materia.matricula})
                                </button>
                            </h2>
                            <div id={`collapseN${index}`} className="accordion-collapse collapse" data-bs-parent="#accordionNecesidades">
                                <div className="accordion-body">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Equipamiento</label>
                                            <EditableList data={itm.equipamiento} field="equipamiento" materiaIndex={index} onChange={handleArrayChange} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Bibliografía</label>
                                            <EditableList data={itm.bibliografia} field="bibliografia" materiaIndex={index} onChange={handleArrayChange} />
                                        </div>
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

const EditableList = ({ data, field, materiaIndex, onChange }: any) => (
    <div className="list-group">
        {data.length === 0 ? <div className="alert alert-info py-1">No hay ítems.</div> : 
            data.map((item: string, idx: number) => (
                <div key={idx} className="input-group mb-2">
                    <input 
                        type="text" 
                        className={`form-control ${item.trim() === "" ? "is-invalid" : ""}`} 
                        value={item} 
                        onChange={(e) => onChange(materiaIndex, field, e.target.value, idx)} 
                    />
                </div>
            ))
        }
    </div>
);