import { useEffect, useState } from "react";
import type { Materia, Pregunta, Respuesta } from "../../../types/types";

interface NecesidadesItem { materia: Materia; equipamiento: string; bibliografia: string; }
interface NecesidadesEstado { materia: Materia; equipamiento: string[]; bibliografia: string[]; }

interface Props {
    departamentoId: number; 
    carreraId: number; 
    pregunta: Pregunta; 
    anio: number; 
    periodo: string;
    manejarCambio?: (items: Respuesta[]) => void;
    notificarValidacion?: (valido: boolean) => void;
}

type EditableFields = 'bibliografia' | 'equipamiento'; 

export default function EquipamientoBibliografia({
    departamentoId, carreraId, pregunta, anio, periodo, manejarCambio, notificarValidacion
}: Props) {
    const [itemsTabla, setItems] = useState<NecesidadesEstado[]>([]); 
    const [itemsOriginales, setItemsOriginales] = useState<NecesidadesEstado[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!departamentoId || !carreraId || !anio || !periodo) return;

        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                notificarValidacion?.(false);

                const res = await fetch(
                    `http://127.0.0.1:8000/informes_sinteticos_completados/bibliografia_equipamiento/?id_dpto=${departamentoId}&id_carrera=${carreraId}&anio=${anio}&periodo=${periodo}`
                );

                if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
                
                const data: NecesidadesItem[] = await res.json();
                if (!Array.isArray(data)) throw new Error("Formato inválido");

                const separar = (s: string): string[] => {
                    return s === '-' ? [] : s.split('\n').filter(line => line.trim() !== '');
                };

                const dataParseada: NecesidadesEstado[] = data.map(item => ({
                    materia: item.materia,
                    equipamiento: separar(item.equipamiento),
                    bibliografia: separar(item.bibliografia),
                }));
                
                setItems(dataParseada);
                setItemsOriginales(JSON.parse(JSON.stringify(dataParseada)));

                const respuestasIniciales: Respuesta[] = dataParseada.map((itm) => ({
                    pregunta_id: pregunta.id,
                    texto_respuesta: JSON.stringify({
                        bibliografia: itm.bibliografia.filter(s => s.trim() !== '').join('\n'),
                        equipamiento: itm.equipamiento.filter(s => s.trim() !== '').join('\n'),
                    }),
                    materia_id: itm.materia.id,
                }));
                manejarCambio?.(respuestasIniciales);

            } catch (err) {
                setError(err instanceof Error ? err.message : "Error desconocido");
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
            
            const errorEquip = original.equipamiento.length > 0 && item.equipamiento.filter(t => t.trim() !== "").length === 0;
            const errorBiblio = original.bibliografia.length > 0 && item.bibliografia.filter(t => t.trim() !== "").length === 0;
            const errorTextoEquip = item.equipamiento.some(t => t.trim() === "");
            const errorTextoBiblio = item.bibliografia.some(t => t.trim() === "");

            return errorEquip || errorBiblio || errorTextoEquip || errorTextoBiblio;
        });

        notificarValidacion?.(!hayError);
    }, [itemsTabla, itemsOriginales, notificarValidacion, isLoading]);


    const handleArrayChange = (
        materiaIndex: number,
        field: EditableFields,
        value: string,
        arrayIndex: number
    ) => {
        const updated = [...itemsTabla];
        updated[materiaIndex][field][arrayIndex] = value;
        setItems(updated);

        const respuestas: Respuesta[] = updated.map((itm) => ({
            pregunta_id: pregunta.id, 
            texto_respuesta: JSON.stringify({
                bibliografia: itm.bibliografia.filter(s => s.trim() !== '').join('\n'),
                equipamiento: itm.equipamiento.filter(s => s.trim() !== '').join('\n'),
            }),
            materia_id: itm.materia.id,
        }));

        manejarCambio?.(respuestas);
    };

    const isError = (idx: number, field: EditableFields) => {
        if (!itemsOriginales[idx]) return false;
        const original = itemsOriginales[idx][field];
        const current = itemsTabla[idx][field];
        
        if (original.length > 0) {
            const allRemoved = current.filter(t => t.trim() !== "").length === 0;
            if (allRemoved) return true;
        }
        return current.some(t => t.trim() === "");
    };

    return (
        <div className="container mt-4">
            <h5 className="text-dark fw-bold mb-3">Equipamiento y Bibliografía</h5>
            <p className="text-muted mb-3 small">{pregunta.enunciado}</p>

            {isLoading ? (
                <div className="text-center text-secondary">Cargando datos...</div>
            ) : error ? (
                <div className="alert alert-danger"><strong>Error:</strong> {error}</div>
            ) : itemsTabla.length === 0 ? (
                <div className="alert alert-warning">No hay materias para esta selección.</div>
            ) : (
                <div className="accordion" id="accordionNecesidades">
                    {itemsTabla.map((itm, index) => (
                        <div className="accordion-item" key={index}>
                            <h2 className="accordion-header" id={`headingN${index}`}>
                                <button
                                    className="accordion-button collapsed"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target={`#collapseN${index}`}
                                    aria-expanded="false"
                                    aria-controls={`collapseN${index}`}
                                >
                                    {itm.materia.nombre} ({itm.materia.matricula})
                                </button>
                            </h2>
                            <div id={`collapseN${index}`} className="accordion-collapse collapse" aria-labelledby={`headingN${index}`} data-bs-parent="#accordionNecesidades">
                                <div className="accordion-body">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Necesidad de Equipamiento</label>
                                            <EditableList
                                                data={itm.equipamiento}
                                                field="equipamiento"
                                                materiaIndex={index}
                                                onChange={(mIndex, f, v, aIndex) => handleArrayChange(mIndex, f, v, aIndex)}
                                            />
                                            {isError(index, "equipamiento") && (
                                                <div className="text-danger small mt-1">
                                                    Requerido: No puede borrar datos existentes ni dejar campos vacíos.
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Necesidad de Bibliografía</label>
                                            <EditableList
                                                data={itm.bibliografia}
                                                field="bibliografia"
                                                materiaIndex={index}
                                                onChange={(mIndex, f, v, aIndex) => handleArrayChange(mIndex, f, v, aIndex)}
                                            />
                                            {isError(index, "bibliografia") && (
                                                <div className="text-danger small mt-1">
                                                    Requerido: No puede borrar datos existentes ni dejar campos vacíos.
                                                </div>
                                            )}
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

interface EditableListProps {
    data: string[];
    field: EditableFields;
    materiaIndex: number;
    onChange: (materiaIndex: number, field: EditableFields, value: string, arrayIndex: number) => void;
}

const EditableList: React.FC<EditableListProps> = ({ data, field, materiaIndex, onChange }) => {
    return (
        <div className="list-group">
            {data.length === 0 ? (
                <div className="alert alert-info py-1">No hay información registrada.</div>
            ) : (
                data.map((item, arrayIndex) => (
                    <div key={arrayIndex} className="input-group mb-2">
                        <input
                            type="text"
                            className={`form-control ${item.trim() === "" ? "is-invalid" : ""}`}
                            value={item}
                            onChange={(e) => onChange(materiaIndex, field, e.target.value, arrayIndex)}
                        />
                    </div>
                ))
            )}
        </div>
    );
};