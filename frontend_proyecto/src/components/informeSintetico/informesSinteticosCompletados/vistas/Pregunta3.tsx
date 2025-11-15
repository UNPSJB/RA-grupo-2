import { useMemo } from "react";
import type { Pregunta, RespuestaInformeSintetico, Materia } from "../../../../types/types"; 
import { CampoCheckbox, CampoTextArea } from "../../completarInformeSintetico/Campos"; 

interface DocenteActividadesBase {
    capacitacion: boolean;
    investigacion: boolean;
    extension: boolean;
    gestion: boolean;
    gestion_texto: string | null;
    observaciones: string | null;
}

interface DocenteConActividadesBase {
    nombre_docente: string;
    rol_docente: string;
    actividades: DocenteActividadesBase;
}

interface DocenteActividadesVista extends Omit<DocenteActividadesBase, 'observaciones' | 'gestion_texto'> {
    observaciones: string; 
    gestion_texto: string; 
}

interface DocenteConActividadesVista extends Omit<DocenteConActividadesBase, 'actividades'> {
    actividades: DocenteActividadesVista;
}

interface ItemActividadesInfo {
    materia: Materia;
    docentes: DocenteConActividadesVista[]; 
}

interface VistaActividadesProps {
    pregunta: Pregunta;
    respuestasPorMateria: Record<number, RespuestaInformeSintetico>; 
}

export default function VistaActividadesDocentes({
    pregunta,
    respuestasPorMateria,
}: VistaActividadesProps) {

    const safeString = (value: string | null | undefined): string => value || "";

    const itemsAMostrar: ItemActividadesInfo[] = useMemo(() => {
        return Object.values(respuestasPorMateria)
            .map(r => {
                if (!r.texto_respuesta || !r.materia) return null;
                
                try {
                    const docentesArray: DocenteConActividadesBase[] = JSON.parse(r.texto_respuesta);
                    
                    const docentesLimpios: DocenteConActividadesVista[] = docentesArray.map(docente => ({
                        nombre_docente: docente.nombre_docente,
                        rol_docente: docente.rol_docente,
                        actividades: {
                            capacitacion: docente.actividades.capacitacion,
                            investigacion: docente.actividades.investigacion,
                            extension: docente.actividades.extension,
                            gestion: docente.actividades.gestion,
                            observaciones: safeString(docente.actividades.observaciones), 
                            gestion_texto: safeString(docente.actividades.gestion_texto)
                        }
                    }));
                    
                    return {
                        materia: r.materia,
                        docentes: docentesLimpios,
                    } as ItemActividadesInfo; 
                } catch (e) {
                    console.error(`Error al parsear respuesta P3 para materia ${r.materia.nombre}:`, e);
                    return null;
                }
            })
            .filter((item): item is ItemActividadesInfo => item !== null)
            .sort((a, b) => a.materia.matricula.localeCompare(b.materia.matricula)); 
    }, [respuestasPorMateria]);

    return (
        <div className="container mt-4">
            <h5 className="text-dark mb-3">3. {pregunta.enunciado}</h5>

            {itemsAMostrar.length === 0 ? (
                <div className="alert alert-warning">
                    No hay información de actividades docentes registrada.
                </div>
            ) : (
                <div className="accordion" id="accordionVistaP3">
                    {itemsAMostrar.map((itemMateria, materiaIndex) => (
                        <div key={itemMateria.materia.id} className="accordion-item">
                            
                            <h2 className="accordion-header" id={`headingVP3_${materiaIndex}`}>
                                <button
                                    className="accordion-button collapsed"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target={`#collapseVP3_${materiaIndex}`}
                                    aria-expanded="false"
                                    aria-controls={`collapseVP3_${materiaIndex}`}
                                >
                                    {itemMateria.materia.matricula} - {itemMateria.materia.nombre}
                                </button>
                            </h2>

                            <div
                                id={`collapseVP3_${materiaIndex}`}
                                className="accordion-collapse collapse"
                                aria-labelledby={`headingVP3_${materiaIndex}`}
                                data-bs-parent="#accordionVistaP3"
                            >
                                <div className="accordion-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-sm align-middle mb-0">
                                            <thead className="table-light text-center">
                                                <tr>
                                                    <th style={{width: '20%'}}>Responsable, Profesor, JTP y/o Auxiliares</th>
                                                    <th colSpan={4}>Desarrollo de actividades</th>
                                                    <th style={{width: '20%'}}>Observaciones-Comentarios</th>
                                                </tr>
                                                <tr>
                                                    <th></th>
                                                    <th>Capacitación</th>
                                                    <th>Investigación</th>
                                                    <th>Extensión</th>
                                                    <th>Gestión</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            
                                            <tbody>
                                                {itemMateria.docentes.map((itemDocente, docenteIndex) => (
                                                    <tr key={docenteIndex}>
                                                        
                                                        <td className="align-middle">
                                                            {itemDocente.nombre_docente}
                                                            <br />
                                                            <small className="text-muted">{itemDocente.rol_docente}</small>
                                                        </td>
                                                        
                                                        <CampoCheckbox 
                                                            checked={itemDocente.actividades.capacitacion}
                                                            onChange={() => {}}
                                                            isReadOnly={true}
                                                        />
                                                        <CampoCheckbox 
                                                            checked={itemDocente.actividades.investigacion}
                                                            onChange={() => {}}
                                                            isReadOnly={true}
                                                        />
                                                        <CampoCheckbox 
                                                            checked={itemDocente.actividades.extension}
                                                            onChange={() => {}}
                                                            isReadOnly={true}
                                                        />
                                                        <CampoCheckbox 
                                                            checked={itemDocente.actividades.gestion}
                                                            onChange={() => {}}
                                                            isReadOnly={true}
                                                        />

                                                        <td>
                                                            <CampoTextArea
                                                                label={null}
                                                                value={itemDocente.actividades.observaciones}
                                                                onChange={() => {}}
                                                                isReadOnly={true}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                                {itemMateria.docentes.length === 0 && (
                                                    <tr>
                                                        <td colSpan={6} className="text-center text-muted">
                                                            No se encontraron docentes para esta materia.
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