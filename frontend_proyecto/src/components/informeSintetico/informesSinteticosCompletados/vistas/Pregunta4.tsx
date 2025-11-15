import { useMemo } from "react";
import type { Pregunta, RespuestaInformeSintetico, Materia } from "../../../../types/types"; 
import { CampoCheckbox, CampoTextArea } from "../../completarInformeSintetico/Campos"; 

const CALIFICACIONES = [
    { code: 'E', label: 'E', key: 'calificacion_E' },
    { code: 'MB', label: 'MB', key: 'calificacion_MB' },
    { code: 'B', label: 'B', key: 'calificacion_B' },
    { code: 'R', label: 'R', key: 'calificacion_R' },
    { code: 'I', label: 'I', key: 'calificacion_I' },
];

interface AuxiliarGuardado {
    nombre: string;
    calificacion: string;
    justificacion: string;
}

interface AuxiliarVista {
    nombre: string;
    calificacion: string;
    justificacion: string;
}

interface ItemDesempenoAuxiliarInfo {
    materia: Materia;
    auxiliares: AuxiliarVista[];
}

interface VistaDesempenoProps {
    pregunta: Pregunta;
    respuestasPorMateria: Record<number, RespuestaInformeSintetico>; 
}

export default function VistaDesempenoAuxiliares({
    pregunta,
    respuestasPorMateria,
}: VistaDesempenoProps) {

    const safeString = (value: string | null | undefined): string => value || "";

    const itemsAMostrar: ItemDesempenoAuxiliarInfo[] = useMemo(() => {
        return Object.values(respuestasPorMateria)
            .map(r => {
                if (!r.texto_respuesta || !r.materia) return null;
                
                try {
                    const auxiliaresArray: AuxiliarGuardado[] = JSON.parse(r.texto_respuesta);
                    
                    const auxiliaresLimpios: AuxiliarVista[] = auxiliaresArray.map(aux => ({
                        nombre: safeString(aux.nombre),
                        calificacion: safeString(aux.calificacion).toUpperCase(),
                        justificacion: safeString(aux.justificacion)
                    }));
                    
                    return {
                        materia: r.materia,
                        auxiliares: auxiliaresLimpios,
                    } as ItemDesempenoAuxiliarInfo;
                } catch (e) {
                    console.error(`Error al parsear respuesta P4 para materia ${r.materia.nombre}:`, e);
                    return null;
                }
            })
            .filter((item): item is ItemDesempenoAuxiliarInfo => item !== null)
            .sort((a, b) => a.materia.matricula.localeCompare(b.materia.matricula)); 
    }, [respuestasPorMateria]);

    return (
        <div className="container mt-4">
            <h5 className="text-dark mb-3">4. {pregunta.enunciado}</h5>

            {itemsAMostrar.length === 0 ? (
                <div className="alert alert-warning">
                    No hay información de desempeño de auxiliares registrada.
                </div>
            ) : (
                <div className="accordion" id="accordionVistaP4">
                    {itemsAMostrar.map((materiaItem, mIndex) => (
                        <div key={materiaItem.materia.id} className="accordion-item">
                            
                            <h2 className="accordion-header" id={`headingVP4_${mIndex}`}>
                                <button
                                    className="accordion-button collapsed"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target={`#collapseVP4_${mIndex}`}
                                    aria-expanded="false"
                                    aria-controls={`collapseVP4_${mIndex}`}
                                >
                                    Espacio Curricular: {materiaItem.materia.nombre} ({materiaItem.materia.matricula})
                                </button>
                            </h2>

                            <div
                                id={`collapseVP4_${mIndex}`}
                                className="accordion-collapse collapse"
                                aria-labelledby={`headingVP4_${mIndex}`}
                                data-bs-parent="#accordionVistaP4"
                            >
                                <div className="accordion-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-sm align-middle mb-0">
                                            <thead className="table-light text-center">
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
                                                    <tr key={aux.nombre}>
                                                        <td className="align-middle">
                                                            {aux.nombre}
                                                        </td>
                                                        {CALIFICACIONES.map(c => {
                                                            const isChecked = aux.calificacion === c.code;
                                                            return (
                                                                <CampoCheckbox
                                                                    key={c.code}
                                                                    checked={isChecked}
                                                                    onChange={() => {}}
                                                                    isReadOnly={true}
                                                                />
                                                            );
                                                        })}
                                                        <td>
                                                            <CampoTextArea
                                                                label={null}
                                                                value={aux.justificacion}
                                                                onChange={() => {}}
                                                                isReadOnly={true}
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
            )}
        </div>
    );
}