import { useEffect, useState } from "react";
import type { Materia } from "../../../types/types";
import { CampoTextArea, CampoCheckbox } from "./Campos";

const CALIFICACIONES = [
    { code: 'E', label: 'E' },
    { code: 'MB', label: 'MB' },
    { code: 'B', label: 'B' },
    { code: 'R', label: 'R' },
    { code: 'I', label: 'I' },
];

interface Pregunta { id: number; enunciado: string; }

interface DesempenoAuxiliarDetalle {
    espacio_curricular: string;
    nombre_apellido: string;
    calificacion_E: boolean;
    calificacion_MB: boolean;
    calificacion_B: boolean;
    calificacion_R: boolean;
    calificacion_I: boolean;
    justificacion: string;
}

interface TablaDesempenoAuxiliar {
    materia: Materia;
    auxiliares: DesempenoAuxiliarDetalle[];
}

interface Respuesta {
    pregunta_id: number;
    texto_respuesta: string;
    materia_id: number;
}

interface Props {
    departamentoId: number;
    carreraId: number;
    pregunta: Pregunta;
    anio: number;
    periodo: string;
    manejarCambio?: (items: Respuesta[]) => void;
}

const boolsToCode = (detalle: DesempenoAuxiliarDetalle): string => {
    if (detalle.calificacion_E) return 'E';
    if (detalle.calificacion_MB) return 'MB';
    if (detalle.calificacion_B) return 'B';
    if (detalle.calificacion_R) return 'R';
    if (detalle.calificacion_I) return 'I';
    return '-';
};

export default function DesempenoAuxiliares({
    departamentoId, carreraId, pregunta, anio, periodo, manejarCambio
}: Props) {
    const [itemsTabla, setItems] = useState<TablaDesempenoAuxiliar[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!departamentoId || !carreraId || !anio || !periodo) return;

        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const res = await fetch(
                    `http://127.0.0.1:8000/informes_sinteticos_completados/desempeno_auxiliares/?id_dpto=${departamentoId}&id_carrera=${carreraId}&anio=${anio}&periodo=${periodo}`
                );

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({ detail: res.statusText }));
                    throw new Error(`Error HTTP ${res.status}: ${errData.detail || res.statusText}`);
                }
                const data: TablaDesempenoAuxiliar[] = await res.json();

                if (!Array.isArray(data)) {
                    throw new Error("El formato de los datos recibidos no es válido.");
                }

                setItems(data);

                const respuestasIniciales = data.map(materiaItem => ({
                    pregunta_id: pregunta.id,
                    materia_id: materiaItem.materia.id,
                    texto_respuesta: JSON.stringify(
                        materiaItem.auxiliares.map(aux => ({
                            nombre: aux.nombre_apellido,
                            calificacion: boolsToCode(aux),
                            justificacion: aux.justificacion,
                        }))
                    )
                }));
                manejarCambio?.(respuestasIniciales);

            } catch (err) {
                console.error("Error al obtener desempeño de auxiliares:", err);
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

    const handleChange = (
        materiaIndex: number,
        auxIndex: number,
        field: keyof DesempenoAuxiliarDetalle,
        value: string | boolean
    ) => {
        const updatedItems = [...itemsTabla];
        const aux = updatedItems[materiaIndex].auxiliares[auxIndex];

        if (typeof value === 'boolean' && field.startsWith('calificacion_')) {
            CALIFICACIONES.forEach(c => {
                const califKey = `calificacion_${c.code}` as keyof DesempenoAuxiliarDetalle;
                (aux[califKey] as boolean) = false;
            });

            if (value === true) {
                (aux[field] as boolean) = true;
            }

        } else if (typeof value === 'string' && field === 'justificacion') {
            (aux[field] as string) = value;
        } else if (typeof value === 'string' && field === 'nombre_apellido') {
            (aux[field] as string) = value;
        }

        setItems(updatedItems);

        const respuestas = updatedItems.map(materiaItem => ({
            pregunta_id: pregunta.id,
            materia_id: materiaItem.materia.id,
            texto_respuesta: JSON.stringify(
                materiaItem.auxiliares.map(aux => ({
                    nombre: aux.nombre_apellido,
                    calificacion: boolsToCode(aux),
                    justificacion: aux.justificacion,
                }))
            )
        }));

        manejarCambio?.(respuestas);
    };

    if (isLoading) return <div className="text-center text-secondary">Cargando desempeño de auxiliares...</div>;
    if (error) return <div className="alert alert-danger"><strong>Error:</strong> {error}</div>;
    if (itemsTabla.length === 0) return <div className="alert alert-warning">No hay auxiliares reportados para estas materias.</div>;

    return (
        <div className="container mt-4">
            <h5 className="text-dark mb-3">{pregunta.enunciado}</h5>
            <div className="accordion" id="accordionDesempenoAuxiliares">
                {itemsTabla.map((materiaItem, mIndex) => (
                    <div key={materiaItem.materia.id} className="accordion-item">

                        <h2 className="accordion-header" id={`headingAux${mIndex}`}>
                            <button
                                className="accordion-button collapsed"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target={`#collapseAux${mIndex}`}
                                aria-expanded="false"
                                aria-controls={`collapseAux${mIndex}`}
                            >
                                Espacio Curricular: {materiaItem.materia.nombre} ({materiaItem.materia.matricula})
                            </button>
                        </h2>

                        <div
                            id={`collapseAux${mIndex}`}
                            className="accordion-collapse collapse"
                            aria-labelledby={`headingAux${mIndex}`}
                            data-bs-parent="#accordionDesempenoAuxiliares"
                        >
                            <div className="accordion-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-bordered table-hover table-sm align-middle mb-0">
                                        <thead className="table-light text-center no-bold">
                                            <tr>
                                                <th style={{ width: '20%' }}>Nombre y Apellido JTP/Auxiliar</th>
                                                <th colSpan={5}>Calificación desempeño auxiliares</th>
                                                <th style={{ width: '40%' }}>Justificación de la calificación</th>
                                            </tr>
                                            <tr>
                                                <th></th>
                                                {CALIFICACIONES.map(c => (
                                                    <th key={c.code} style={{ width: '5%' }}>{c.label}</th>
                                                ))}
                                                <th></th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {materiaItem.auxiliares.map((aux, aIndex) => (
                                                <tr key={aux.nombre_apellido}>
                                                    <td>
                                                        {aux.nombre_apellido}
                                                    </td>
                                                    {CALIFICACIONES.map(c => {
                                                        const califKey = `calificacion_${c.code}` as keyof DesempenoAuxiliarDetalle;
                                                        return (
                                                            <CampoCheckbox
                                                                key={c.code}
                                                                checked={aux[califKey] as boolean}
                                                                onChange={(isChecked) => handleChange(mIndex, aIndex, califKey, isChecked)}
                                                            />
                                                        );
                                                    })}
                                                    <td>
                                                        <CampoTextArea
                                                            label={null}
                                                            value={aux.justificacion}
                                                            onChange={(v) => handleChange(mIndex, aIndex, 'justificacion', v)}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                            {materiaItem.auxiliares.length === 0 && (
                                                <tr>
                                                    <td colSpan={7} className="text-center text-muted">
                                                        No se encontraron auxiliares para esta materia.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}