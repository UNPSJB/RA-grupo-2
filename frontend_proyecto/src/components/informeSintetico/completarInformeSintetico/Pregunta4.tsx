import { useEffect, useState } from "react";
import type { Materia, Pregunta, Respuesta } from "../../../types/types";
import { CampoTextArea, CampoCheckbox } from "./Campos";

const CALIFICACIONES = [
    { code: 'E', label: 'E' },
    { code: 'MB', label: 'MB' },
    { code: 'B', label: 'B' },
    { code: 'R', label: 'R' },
    { code: 'I', label: 'I' },
];

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

interface Props {
    departamentoId: number;
    carreraId: number;
    pregunta: Pregunta;
    anio: number;
    periodo: string;
    manejarCambio?: (items: Respuesta[]) => void;
    notificarValidacion?: (valido: boolean) => void;
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
    departamentoId, carreraId, pregunta, anio, periodo, manejarCambio, notificarValidacion
}: Props) {
    const [itemsTabla, setItems] = useState<TablaDesempenoAuxiliar[]>([]);
    const [itemsOriginales, setItemsOriginales] = useState<TablaDesempenoAuxiliar[]>([]);
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
                    const errorDetalle = await res.json().catch(() => ({ detail: res.statusText }));
                    throw new Error(`Error HTTP ${res.status}: ${errorDetalle.detail || res.statusText}`);
                }

                const data: TablaDesempenoAuxiliar[] = await res.json();

                if (!Array.isArray(data)) {
                    throw new Error("El formato de los datos recibidos no es válido.");
                }

                const datosParseados = data.map(materia => ({
                    ...materia,
                    auxiliares: materia.auxiliares.map(aux => ({
                        ...aux,
                        justificacion: aux.justificacion || '',
                    }))
                }));
                
                setItems(datosParseados);
                setItemsOriginales(JSON.parse(JSON.stringify(datosParseados)));

                const respuestasIniciales = datosParseados.map(materiaItem => ({
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
                    setError(`Error en la carga: ${err.message}`);
                } else {
                    setError("Error desconocido en la carga de datos.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [departamentoId, carreraId, anio, periodo, pregunta.id]);


    useEffect(() => {
        if (itemsTabla.length === 0) return;

        const hayError = itemsTabla.some((materiaActual, mIdx) => {
            const materiaOriginal = itemsOriginales[mIdx];
            if (!materiaOriginal) return false;

            return materiaActual.auxiliares.some((auxActual, aIdx) => {
                const auxOriginal = materiaOriginal.auxiliares[aIdx];
                if (!auxOriginal) return false;

                const vOrig = auxOriginal.justificacion || '';
                const vCurr = auxActual.justificacion || '';

                const esRequerido = vOrig.trim().length > 0;
                return esRequerido && vCurr.trim().length === 0;
            });
        });

        notificarValidacion?.(!hayError);
    }, [itemsTabla, itemsOriginales, notificarValidacion]);

    const handleChange = (
        materiaIndex: number,
        auxIndex: number,
        field: keyof DesempenoAuxiliarDetalle,
        value: string | boolean
    ) => {
        const updatedItems = [...itemsTabla];
        const materia = { ...updatedItems[materiaIndex] };
        const auxiliares = [...materia.auxiliares];
        const aux = { ...auxiliares[auxIndex] };

        if (typeof value === 'boolean' && field.startsWith('calificacion_')) {
            CALIFICACIONES.forEach(c => {
                const califKey = `calificacion_${c.code}` as keyof DesempenoAuxiliarDetalle;
                (aux[califKey] as any) = false;
            });

            if (value === true) {
                (aux[field] as any) = true;
            }
        } else {
            (aux[field] as any) = value; 
        }

        auxiliares[auxIndex] = aux;
        materia.auxiliares = auxiliares;
        updatedItems[materiaIndex] = materia;

        setItems(updatedItems);

        const respuesta: Respuesta = {
            pregunta_id: pregunta.id,
            materia_id: materia.materia.id,
            texto_respuesta: JSON.stringify(
                materia.auxiliares.map(a => ({
                    nombre: a.nombre_apellido,
                    calificacion: boolsToCode(a),
                    justificacion: a.justificacion,
                }))
            )
        };

        manejarCambio?.([respuesta]);
    };

    const isError = (
        materiaIndex: number,
        auxIndex: number,
        field: 'justificacion'
    ): boolean => {
        const materiaOriginal = itemsOriginales[materiaIndex];
        const materiaActual = itemsTabla[materiaIndex];

        if (!materiaOriginal || !materiaActual) return false;

        const auxOriginal = materiaOriginal.auxiliares[auxIndex];
        const auxActual = materiaActual.auxiliares[auxIndex];

        if (!auxOriginal || !auxActual) return false;

        const vOrig = auxOriginal[field] || '';
        const vCurr = auxActual[field] || '';

        const esRequerido = vOrig.trim().length > 0;
        return esRequerido && vCurr.trim().length === 0;
    };

    if (isLoading) return <div className="text-center text-secondary">Cargando...</div>;
    if (error) return <div className="alert alert-danger"><strong>Error:</strong> {error}</div>;
<<<<<<< .mine
    if (itemsTabla.length === 0) return <div className="alert alert-warning">No hay auxiliares.</div>;
=======
    if (itemsTabla.length === 0) return <div className="alert alert-warning">No hay materias para esta selección.</div>;
>>>>>>> .theirs

    return (
        <div className="container mt-4">
            <h5 className="text-dark fw-bold mb-3">Valoracion del desempeño de los auxiliares </h5>
            <p className="text-muted mb-3">{pregunta.enunciado}</p>
            <div className="accordion" id="accordionAux">
                {itemsTabla.map((materiaItem, mIndex) => (
                    <div key={materiaItem.materia.id} className="accordion-item">

                        <h2 className="accordion-header" id={`headingAux${mIndex}`}>
                            <button
                                className="accordion-button collapsed"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target={`#collapseAux${mIndex}`}
                            >
                                Espacio Curricular: {materiaItem.materia.nombre} ({materiaItem.materia.matricula})
                            </button>
                        </h2>

                        <div
                            id={`collapseAux${mIndex}`}
                            className="accordion-collapse collapse"
                            data-bs-parent="#accordionAux"
                        >
                            <div className="accordion-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-bordered table-hover table-sm align-middle mb-0">
                                        <thead className="table-light text-center">
                                            <tr>
                                                <th style={{ width: '20%' }}>Auxiliar</th>
                                                <th colSpan={5}>Calificación</th>
                                                <th style={{ width: '40%' }}>Justificación</th>
                                            </tr>
                                            <tr>
                                                <th></th>
                                                {CALIFICACIONES.map(c => <th key={c.code} style={{width:'5%'}}>{c.label}</th>)}
                                                <th></th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {materiaItem.auxiliares.map((aux, aIndex) => (
                                                <tr key={aux.nombre_apellido}>
                                                    <td>{aux.nombre_apellido}</td>
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
                                                            error={isError(mIndex, aIndex, 'justificacion')}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                            {materiaItem.auxiliares.length === 0 && <tr><td colSpan={7} className="text-center">Sin auxiliares.</td></tr>}
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