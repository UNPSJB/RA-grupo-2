import React, { useEffect, useState } from "react"; 
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
interface DocenteActividades {
    capacitacion: boolean;
    investigacion: boolean;
    extension: boolean;
    gestion: boolean;
    gestion_texto: string | null;
    observaciones: string | null;
}
interface DocenteConActividades {
    nombre_docente: string;
    rol_docente: string;
    actividades: DocenteActividades;
}
interface ActividadesPorMateriaItem {
    materia: Materia;
    docentes: DocenteConActividades[];
}
interface Props {
    id_dpto: number;
    id_carrera: number;
    anio: number;
    periodo: string;
    pregunta: Pregunta;
    manejarCambio?: (respuestas: Respuesta[]) => void;
}

export default function ActividadesDocentes({
    id_dpto,
    id_carrera,
    anio,
    periodo,
    pregunta,
    manejarCambio,
}: Props) {
    const [listaMaterias, setListaMaterias] = useState<ActividadesPorMateriaItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id_dpto || !id_carrera || !anio || !periodo) return;
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const res = await fetch(
                    `http://127.0.0.1:8000/informes_sinteticos_completados/actividades-docentes/?id_dpto=${id_dpto}&id_carrera=${id_carrera}&anio=${anio}&periodo=${periodo}`
                );
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({ detail: res.statusText }));
                    throw new Error(`Error HTTP ${res.status}: ${errData.detail || res.statusText}`);
                }
                const data: ActividadesPorMateriaItem[] = await res.json();
                if (!Array.isArray(data)) {
                    throw new Error("El formato de los datos recibidos no es válido.");
                }
                
                const datosIniciales = data.map(materia => ({
                    ...materia,
                    docentes: materia.docentes.map(docente => ({
                        ...docente,
                        actividades: {
                            ...docente.actividades,
                            observaciones: docente.actividades.observaciones || ""
                        }
                    }))
                }));

                setListaMaterias(datosIniciales);

                const respuestasIniciales: Respuesta[] = datosIniciales.map((itemMateria) => ({
                    pregunta_id: pregunta.id,
                    materia_id: itemMateria.materia.id,
                    texto_respuesta: JSON.stringify(itemMateria.docentes)
                }));
                manejarCambio?.(respuestasIniciales);
            } catch (err) {
                console.error("Error al obtener actividades docentes:", err);
                if (err instanceof Error) setError(err.message);
                else setError("Error desconocido");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id_dpto, id_carrera, anio, periodo, pregunta.id]);

    const handleChange = (
        materiaIndex: number, 
        docenteIndex: number, 
        field: keyof DocenteActividades, 
        value: boolean | string | null
    ) => {
        const newState = listaMaterias.map((m, mIdx) => {
            if (mIdx !== materiaIndex) return m;
            
            const newDocentes = m.docentes.map((d, dIdx) => {
                if (dIdx !== docenteIndex) return d;
                
                const newActividades = { ...d.actividades, [field]: value };
                return { ...d, actividades: newActividades };
            });
            return { ...m, docentes: newDocentes };
        });
        
        setListaMaterias(newState);

        const respuestas: Respuesta[] = newState.map((itemMateria) => ({
            pregunta_id: pregunta.id,
            materia_id: itemMateria.materia.id,
            texto_respuesta: JSON.stringify(itemMateria.docentes)
        }));
        
        manejarCambio?.(respuestas);
    };

    return (
        <div className="container mt-4">
            <h4 className="mb-3">{pregunta.enunciado}</h4>

            {isLoading ? (
                <div className="text-center text-secondary">Cargando datos de docentes...</div>
            ) : error ? (
                <div className="alert alert-danger"><strong>Error:</strong> {error}</div>
            ) : listaMaterias.length === 0 ? (
                <div className="alert alert-warning">No hay materias para esta selección.</div>
            ) : (
                <>
                    <div className="table-responsive">
                        <table className="table table-bordered table-hover table-sm align-middle">
                            <thead className="table-light text-center">
                                <tr>
                                    <th style={{width: '20%'}}>Espacio curricular</th>
                                    <th style={{width: '20%'}}>Responsable, Profesor, JTP y/o Auxiliares</th>
                                    <th colSpan={4}>Desarrollo de actividades</th>
                                    <th style={{width: '20%'}}>Observaciones-Comentarios</th>
                                </tr>
                                <tr>
                                    <th></th>
                                    <th></th>
                                    <th style={{width: '10%'}}>Capacitación</th>
                                    <th style={{width: '10%'}}>Investigación</th>
                                    <th style={{width: '10%'}}>Extensión</th>
                                    <th style={{width: '10%'}}>Gestión</th>
                                    <th></th>
                                </tr>
                            </thead>
                            
                            <tbody>
                                {listaMaterias.map((itemMateria, materiaIndex) => (
                                    <React.Fragment key={itemMateria.materia.id}>
                                        {itemMateria.docentes.map((itemDocente, docenteIndex) => (
                                            <tr key={docenteIndex}>
                                                {docenteIndex === 0 && (
                                                    <td rowSpan={itemMateria.docentes.length} style={{verticalAlign: 'middle'}}>
                                                        <strong>{itemMateria.materia.matricula}</strong>
                                                        <br />
                                                        {itemMateria.materia.nombre}
                                                    </td>
                                                )}
                                                
                                                <td>
                                                    <strong>{itemDocente.nombre_docente}</strong>
                                                    <br />
                                                    <small className="text-muted">{itemDocente.rol_docente}</small>
                                                </td>
                                                
                                                <CampoCheckbox 
                                                    checked={itemDocente.actividades.capacitacion}
                                                    onChange={(v) => handleChange(materiaIndex, docenteIndex, 'capacitacion', v)}
                                                />
                                                <CampoCheckbox 
                                                    checked={itemDocente.actividades.investigacion}
                                                    onChange={(v) => handleChange(materiaIndex, docenteIndex, 'investigacion', v)}
                                                />
                                                <CampoCheckbox 
                                                    checked={itemDocente.actividades.extension}
                                                    onChange={(v) => handleChange(materiaIndex, docenteIndex, 'extension', v)}
                                                />
                                                <CampoCheckbox 
                                                    checked={itemDocente.actividades.gestion}
                                                    onChange={(v) => handleChange(materiaIndex, docenteIndex, 'gestion', v)}
                                                />

                                                <td>
                                                    <textarea 
                                                        className="form-control form-control-sm"
                                                        rows={2}
                                                        placeholder="Observaciones..."
                                                        value={itemDocente.actividades.observaciones || ""}
                                                        onChange={(e) => handleChange(materiaIndex, docenteIndex, 'observaciones', e.target.value)}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                        {itemMateria.docentes.length === 0 && (
                                            <tr>
                                                <td>
                                                    <strong>{itemMateria.materia.matricula}</strong>
                                                    <br />
                                                    {itemMateria.materia.nombre}
                                                </td>
                                                <td colSpan={6} className="text-center text-muted">
                                                    No se encontraron docentes para esta materia.
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

function CampoCheckbox({
    checked,
    onChange,
}: {
    checked: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <td 
            className="text-center" 
            style={{ 
                cursor: 'pointer', 
                fontWeight: 'bold', 
                fontSize: '1.2rem',
                userSelect: 'none'
            }}
            onClick={() => onChange(!checked)}
        >
            {checked ? 'X' : '-'}
        </td>
    );
}