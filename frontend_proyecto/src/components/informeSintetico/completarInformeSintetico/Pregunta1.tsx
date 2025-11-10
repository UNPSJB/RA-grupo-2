import { useEffect, useState } from "react";
import type { Materia, Pregunta, Respuesta } from "../../../types/types";
interface NecesidadesItem { materia: Materia; equipamiento: string; bibliografia: string; }

interface NecesidadesEstado { materia: Materia; equipamiento: string[]; bibliografia: string[]; }

interface Props {
    departamentoId: number; carreraId: number; pregunta: Pregunta; anio: number; periodo: string;
    manejarCambio?: (items: Respuesta[]) => void;
}
type EditableFields = 'bibliografia' | 'equipamiento'; 

export default function EquipamientoBibliografia({
    departamentoId, carreraId, pregunta, anio, periodo, manejarCambio
}: Props) {
    const [itemsTabla, setItems] = useState<NecesidadesEstado[]>([]); 
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!departamentoId || !carreraId || !anio || !periodo) return;

        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const res = await fetch(
                    `http://127.0.0.1:8000/informes_sinteticos_completados/bibliografia_equipamiento/?id_dpto=${departamentoId}&id_carrera=${carreraId}&anio=${anio}&periodo=${periodo}`
                );

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({ detail: res.statusText }));
                    throw new Error(`Error HTTP ${res.status}: ${errData.detail || res.statusText}`);
                }
                const data: NecesidadesItem[] = await res.json();
                
                if (!Array.isArray(data)) {
                    throw new Error("El formato de los datos recibidos no es válido.");
                }

                const separar = (s: string): string[] => {
                    return s === '-' ? [] : s.split('\n').filter(line => line.trim() !== '');
                };

                const dataParseada: NecesidadesEstado[] = data.map(item => ({
                    materia: item.materia,
                    equipamiento: separar(item.equipamiento),
                    bibliografia: separar(item.bibliografia),
                }));
                
                setItems(dataParseada);

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
                console.error("Error al obtener necesidades:", err);
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


    return (
        <div className="container mt-4">
            <h5 className="text-dark mb-3">{pregunta.enunciado}</h5>

            {isLoading ? (
                <div className="text-center text-secondary">Cargando datos...</div>
            ) : error ? (
                <div className="alert alert-danger">
                    <strong>Error:</strong> {error}
                </div>
            ) : itemsTabla.length === 0 ? (
                <div className="alert alert-warning">
                    No hay necesidades de equipamiento/bibliografía reportadas.
                </div>
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
                            <div
                                id={`collapseN${index}`}
                                className="accordion-collapse collapse"
                                aria-labelledby={`headingN${index}`}
                                data-bs-parent="#accordionNecesidades"
                            >
                                <div className="accordion-body">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Necesidad de Equipamiento</label>
                                            <EditableList
                                                data={itm.equipamiento}
                                                field="equipamiento"
                                                materiaIndex={index}
                                                onChange={(mIndex, f, v, aIndex) => handleArrayChange(mIndex, f, v, aIndex)}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Necesidad de Bibliografía</label>
                                            <EditableList
                                                data={itm.bibliografia}
                                                field="bibliografia"
                                                materiaIndex={index}
                                                onChange={(mIndex, f, v, aIndex) => handleArrayChange(mIndex, f, v, aIndex)}
                                            />
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
                <div className="alert alert-info py-1">No hay ítems.</div>
            ) : (
                data.map((item, arrayIndex) => (
                    <div key={arrayIndex} className="input-group mb-2">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Edite la necesidad..."
                            value={item}
                            onChange={(e) => onChange(materiaIndex, field, e.target.value, arrayIndex)}
                        />
                    </div>
                ))
            )}
        </div>
    );
};