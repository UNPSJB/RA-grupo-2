import { useEffect, useState } from "react";
import type { Materia } from "../../../types/types";

interface Pregunta {
    id: number;
    enunciado: string;
}

interface Respuesta {
    pregunta_id: number;
    materia_id: number;
    texto_respuesta: string;
}

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
    estrategias: string;
}

interface ContenidosProps {
    id_dpto: number;
    id_carrera: number;
    anio: number;
    periodo: string;
    pregunta: Pregunta;
    manejarCambio?: (respuestas: Respuesta[]) => void;
}

export default function ContenidosAlcanzados({
    id_dpto,
    id_carrera,
    anio,
    periodo,
    pregunta,
    manejarCambio,
}: ContenidosProps) {
    const [items, setItems] = useState<ContenidosItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id_dpto || !id_carrera || !anio || !periodo) return;

        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const res = await fetch(
                    `http://127.0.0.1:8000/informes_sinteticos_completados/temas-desarrollados/?id_dpto=${id_dpto}&id_carrera=${id_carrera}&anio=${anio}&periodo=${periodo}`
                );

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({ detail: res.statusText }));
                    throw new Error(`Error HTTP ${res.status}: ${errData.detail || res.statusText}`);
                }

                const data: TemasFetchItem[] = await res.json();

                if (!Array.isArray(data)) {
                    throw new Error("El formato de los datos recibidos no es válido.");
                }

                const itemsIniciales: ContenidosItem[] = data.map((m) => {
                    let initialPorcentaje: number | null = parseFloat(m.porcentaje_texto || "");
                    if (isNaN(initialPorcentaje)) {
                        initialPorcentaje = null;
                    }

                    return {
                        materia: m.materia,
                        codigo: m.materia.matricula || 'N/A', 
                        nombre: m.materia.nombre,
                        porcentaje: initialPorcentaje,
                        estrategias: m.estrategias_texto || ""
                    };
                });
                
                setItems(itemsIniciales);

                const respuestasIniciales: Respuesta[] = itemsIniciales.map((item) => ({
                    pregunta_id: pregunta.id,
                    materia_id: item.materia.id,
                    texto_respuesta: JSON.stringify({
                        porcentaje: item.porcentaje,
                        estrategias: item.estrategias
                    })
                }));
                manejarCambio?.(respuestasIniciales);

            } catch (err) {
                console.error("Error al obtener lista de materias:", err);
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
    }, [id_dpto, id_carrera, anio, periodo, pregunta.id]);


    const handleChange = <K extends keyof ContenidosItem>(
        index: number,
        field: K,
        value: ContenidosItem[K]
    ) => {
        const updated = [...items];
        updated[index][field] = value;
        setItems(updated);

        const respuestas: Respuesta[] = updated.map((item) => ({
            pregunta_id: pregunta.id,
            materia_id: item.materia.id,
            texto_respuesta: JSON.stringify({
                porcentaje: item.porcentaje,
                estrategias: item.estrategias
            })
        }));
        manejarCambio?.(respuestas);
    };

    return (
        <div className="container mt-4">
            <h4 className="mb-3">{pregunta.enunciado}</h4>

            {isLoading ? (
                <div className="text-center text-secondary">Cargando materias...</div>
            ) : error ? (
                <div className="alert alert-danger">
                    <strong>Error:</strong> {error}
                </div>
            ) : items.length === 0 ? (
                <div className="alert alert-warning">
                    No hay materias para esta selección.
                </div>
            ) : (
                <>
                    <div className="accordion" id="accordionContenidos">
                        {items.map((item, index) => (
                            <div className="accordion-item" key={item.materia.id}>
                                <h2 className="accordion-header" id={`heading${index}`}>
                                    <button
                                        className="accordion-button collapsed"
                                        type="button"
                                        data-bs-toggle="collapse"
                                        data-bs-target={`#collapse${index}`}
                                        aria-expanded="false"
                                        aria-controls={`collapse${index}`}
                                    >
                                        {item.codigo} - {item.nombre}
                                    </button>
                                </h2>
                                <div
                                    id={`collapse${index}`}
                                    className="accordion-collapse collapse"
                                    aria-labelledby={`heading${index}`}
                                    data-bs-parent="#accordionContenidos"
                                >
                                    <div className="accordion-body">
                                        <div className="row g-3">
                                            <CampoPorcentaje
                                                label="Porcentual contenidos alcanzados (%)"
                                                value={item.porcentaje}
                                                onChange={(v) => handleChange(index, "porcentaje", v)}
                                            />
                                            <CampoTextoLargo
                                                label="Estrategias propuestas"
                                                value={item.estrategias}
                                                onChange={(v) => handleChange(index, "estrategias", v)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}


function CampoTextoLargo({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="col-12">
            <label className="form-label">{label}</label>
            <textarea
                className="form-control"
                rows={3}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

function CampoPorcentaje({
    label,
    value,
    onChange,
}: {
    label: string;
    value: number | null;
    onChange: (v: number | null) => void;
}) {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === "") {
            onChange(null);
            return;
        }
        
        const num = Number(val);
        if (num >= 0 && num <= 100) {
            onChange(num);
        } else if (num > 100) {
            onChange(100);
        } else if (num < 0) {
            onChange(0);
        }
    };

    return (
        <div className="col-md-6">
            <label className="form-label">{label}</label>
            <input
                type="number"
                className="form-control"
                min={0}
                max={100}
                value={value === null ? "" : value} 
                onChange={handleChange}
                placeholder="Ej: 80"
            />
        </div>
    );
}