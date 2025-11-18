import { useEffect, useState } from "react";
import type { Materia, Pregunta, Respuesta } from "../../../types/types";
import { CampoCheckbox, CampoTextArea } from "./Campos";

interface DocenteActividades {
    capacitacion: boolean;
    investigacion: boolean;
    extension: boolean;
    gestion: boolean;
    gestion_texto: string | null;
    observaciones: string | null;
}

type CampoTextoActividades = 'gestion_texto' | 'observaciones'; 

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
    notificarValidacion?: (valido: boolean) => void;
}

export default function ActividadesDocentes({
    id_dpto,
    id_carrera,
    anio,
    periodo,
    pregunta,
    manejarCambio,
    notificarValidacion, 
}: Props) {
    const [listaMaterias, setListaMaterias] = useState<ActividadesPorMateriaItem[]>([]);
    const [listaMateriasOriginales, setListaMateriasOriginales] = useState<ActividadesPorMateriaItem[]>([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id_dpto || !id_carrera) return;
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const res = await fetch(
                    `http://127.0.0.1:8000/informes_sinteticos_completados/actividades-docentes/?id_dpto=${id_dpto}&id_carrera=${id_carrera}&anio=${anio}&periodo=${periodo}`
                );
                
                if (!res.ok) {
                    const errorDetalle = await res.json().catch(() => ({ detail: res.statusText }));
                    throw new Error(`Error HTTP ${res.status}: ${errorDetalle.detail || res.statusText}`);
                }
                
                const data: ActividadesPorMateriaItem[] = await res.json();
                
                const datosIniciales = data.map(materia => ({
                    ...materia,
                    docentes: materia.docentes.map(docente => ({
                        ...docente,
                        actividades: {
                            ...docente.actividades,
                            gestion_texto: docente.actividades.gestion_texto || "", 
                            observaciones: docente.actividades.observaciones || ""
                        }
                    }))
                }));

                setListaMaterias(datosIniciales);
                setListaMateriasOriginales(JSON.parse(JSON.stringify(datosIniciales))); 

                const respuestasIniciales: Respuesta[] = datosIniciales.map((itemMateria) => ({
                    pregunta_id: pregunta.id,
                    materia_id: itemMateria.materia.id,
                    texto_respuesta: JSON.stringify(itemMateria.docentes)
                }));
                manejarCambio?.(respuestasIniciales);
            } catch (err) {
                console.error(err);
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Error cargando datos.");
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id_dpto, id_carrera, anio, periodo, pregunta.id]);

    useEffect(() => {
        if (listaMaterias.length === 0) return;

        const hayError = listaMaterias.some((materiaActual, mIdx) => {
            const materiaOriginal = listaMateriasOriginales[mIdx];
            if (!materiaOriginal) return false;

            return materiaActual.docentes.some((docenteActual, dIdx) => {
                const docenteOriginal = materiaOriginal.docentes[dIdx];
                if (!docenteOriginal) return false;

                const actividadesOriginales = docenteOriginal.actividades;
                const actividadesActuales = docenteActual.actividades;

                const campos: CampoTextoActividades[] = ['gestion_texto', 'observaciones'];
                
                return campos.some(key => {
                    const vOrig = actividadesOriginales[key] || '';
                    const vCurr = actividadesActuales[key] || '';
                    
                    const esRequerido = vOrig.trim().length > 0;
                    return esRequerido && vCurr.trim().length === 0;
                });
            });
        });
        
        notificarValidacion?.(!hayError);
    }, [listaMaterias, listaMateriasOriginales, notificarValidacion]);

    const handleChange = (
        materiaIndex: number, 
        docenteIndex: number, 
        field: keyof DocenteActividades, 
        value: boolean | string | null
    ) => {
        const newState = [...listaMaterias];
        const materia = { ...newState[materiaIndex] };
        const docentes = [...materia.docentes];
        const docente = { ...docentes[docenteIndex] };
        
        const actividades: DocenteActividades = { ...docente.actividades, [field]: value };
        
        docente.actividades = actividades;
        docentes[docenteIndex] = docente;
        materia.docentes = docentes;
        newState[materiaIndex] = materia;
        
        setListaMaterias(newState);

        const respuesta: Respuesta = {
            pregunta_id: pregunta.id,
            materia_id: materia.materia.id,
            texto_respuesta: JSON.stringify(materia.docentes)
        };
        
        manejarCambio?.([respuesta]);
    };

    const isError = (
        materiaIndex: number,
        docenteIndex: number,
        field: CampoTextoActividades
    ): boolean => {
        const materiaOriginal = listaMateriasOriginales[materiaIndex];
        const materiaActual = listaMaterias[materiaIndex];

        if (!materiaOriginal || !materiaActual) return false;

        const docenteOriginal = materiaOriginal.docentes[docenteIndex];
        const docenteActual = materiaActual.docentes[docenteIndex];

        if (!docenteOriginal || !docenteActual) return false;

        const vOrig = docenteOriginal.actividades[field] || '';
        const vCurr = docenteActual.actividades[field] || '';
        
        const esRequerido = vOrig.trim().length > 0;
        return esRequerido && vCurr.trim().length === 0;
    };

    return (
        <div className="container mt-4">
            <h5 className="text-dark mb-3">{pregunta.enunciado}</h5>

            {isLoading ? (
                <div className="text-center text-secondary">Cargando datos...</div>
            ) : error ? (
                <div className="alert alert-danger"><strong>Error:</strong> {error}</div>
            ) : listaMaterias.length === 0 ? (
                <div className="alert alert-warning">No hay materias.</div>
            ) : (
                <div className="accordion" id="accordionActividades">
                    {listaMaterias.map((itemMateria, materiaIndex) => (
                        <div key={itemMateria.materia.id} className="accordion-item">
                            
                            <h2 className="accordion-header" id={`headingAct${materiaIndex}`}>
                                <button
                                    className="accordion-button collapsed"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target={`#collapseAct${materiaIndex}`}
                                >
                                    {itemMateria.materia.matricula} - {itemMateria.materia.nombre}
                                </button>
                            </h2>

                            <div
                                id={`collapseAct${materiaIndex}`}
                                className="accordion-collapse collapse"
                                data-bs-parent="#accordionActividades"
                            >
                                <div className="accordion-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-hover table-sm align-middle mb-0">
                                            <thead className="table-light text-center">
                                                <tr>
                                                    <th style={{width: '20%'}}>Docente</th>
                                                    <th colSpan={4}>Actividades</th>
                                                    <th style={{width: '20%'}}>Observaciones</th>
                                                </tr>
                                                <tr>
                                                    <th></th>
                                                    <th style={{width: '10%'}}>Cap</th>
                                                    <th style={{width: '10%'}}>Inv</th>
                                                    <th style={{width: '10%'}}>Ext</th>
                                                    <th style={{width: '10%'}}>Ges</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            
                                            <tbody>
                                                {itemMateria.docentes.map((itemDocente, docenteIndex) => (
                                                    <tr key={docenteIndex}>
                                                        <td>
                                                            {itemDocente.nombre_docente}
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
                                                            <CampoTextArea
                                                                label={null}
                                                                value={itemDocente.actividades.observaciones || ""}
                                                                onChange={(v) => handleChange(materiaIndex, docenteIndex, 'observaciones', v)}
                                                                error={isError(materiaIndex, docenteIndex, 'observaciones')} 
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                                {itemMateria.docentes.length === 0 && (
                                                    <tr><td colSpan={6} className="text-center text-muted">No hay docentes.</td></tr>
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