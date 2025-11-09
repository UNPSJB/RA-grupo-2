import { useState, useMemo, Fragment, useRef, useEffect, useCallback, type RefObject, type FC } from "react";
import { Link } from "react-router-dom"; 

interface ItemFila {
    equipo: string;
    bibliografia: string;
}

interface RespuestaPlana {
    pregunta_id: number;
    texto_respuesta: string;
}

interface Pregunta { 
    id: number; 
    enunciado: string; 
    categoria_id: number; 
}

interface CategoriaConPreguntas { 
    cod: string; 
    texto: string; 
    preguntas: Pregunta[]; 
    id: number; 
}

interface Props {
    categoria: CategoriaConPreguntas;
    manejarCambioEstructura: (data: RespuestaPlana[]) => void; 
}

// Estilos base para el botón X
const DELETE_BUTTON_STYLE: React.CSSProperties = {
    padding: '0 8px',
    height: '28px',
    borderRadius: '4px',
    lineHeight: '1.2rem',
    fontSize: '1.1rem',
    flexShrink: 0
};

export default function CategoriaEquipamiento({ categoria, manejarCambioEstructura }: Props) {
    
    const pEquipo = useMemo(() => 
      categoria.preguntas.find(p => p.enunciado.toLowerCase().includes("equipamiento")), 
      [categoria.preguntas]
    );
    
    const pBibliografia = useMemo(() => 
      categoria.preguntas.find(p => p.enunciado.toLowerCase().includes("bibliografia")), 
      [categoria.preguntas]
    );
    
    const EQUIPO_ID = pEquipo?.id;
    const BIBLIO_ID = pBibliografia?.id;

    // 🛑 ÚNICO STATE PARA ALMACENAR LOS PARES RELACIONADOS
    const [filas, setFilas] = useState<ItemFila[]>([]);
    
    const [nuevoItemEquipo, setNuevoItemEquipo] = useState("");
    const [nuevoItemBibliografia, setNuevoItemBibliografia] = useState("");

    const enviarRespuestasAlPadre = (currentFilas: ItemFila[]) => {
        if (!EQUIPO_ID || !BIBLIO_ID) return;

        const respuestasPlanas: RespuestaPlana[] = [];
        
        currentFilas.forEach(fila => {
            if (fila.equipo.trim() !== '') {
                 respuestasPlanas.push({ pregunta_id: EQUIPO_ID, texto_respuesta: fila.equipo.trim() });
            }
            if (fila.bibliografia.trim() !== '') {
                respuestasPlanas.push({ pregunta_id: BIBLIO_ID, texto_respuesta: fila.bibliografia.trim() });
            }
        });
        
        manejarCambioEstructura(respuestasPlanas);
    };

    // 🛑 FUNCIÓN ÚNICA DE AGREGAR FILA COMPLETA
    const agregarFila = (origen: 'equipo' | 'bibliografia') => {
        const equipo = nuevoItemEquipo.trim();
        const biblio = nuevoItemBibliografia.trim();

        if (equipo === '' && biblio === '') {
            return;
        }

        const nuevaFila: ItemFila = {
            equipo: equipo,
            bibliografia: biblio,
        };

        const nuevasFilas = [...filas, nuevaFila];
        setFilas(nuevasFilas);
        
        // Limpiamos ambos inputs
        setNuevoItemEquipo("");
        setNuevoItemBibliografia("");
        
        enviarRespuestasAlPadre(nuevasFilas);
    };

    // 🛑 FUNCIÓN ÚNICA DE ELIMINAR FILA COMPLETA
    const eliminarFila = (index: number) => {
        const nuevasFilas = filas.filter((_, i) => i !== index);
        setFilas(nuevasFilas);
        enviarRespuestasAlPadre(nuevasFilas);
    };

    if (!pEquipo || !pBibliografia) {
        return <div className="alert alert-warning">Error: Preguntas no asociadas correctamente.</div>;
    }

    // ----------------------------------------------------
    // La parte del renderizado se mantiene VISUALMENTE igual a tu original, 
    // pero lee de `filas` y usa `eliminarFila`.
    // ----------------------------------------------------

    return (
        <Fragment>
            <div className="mb-4">
                <label className="form-label mb-3"> 
                    Equipamiento e insumos
                </label>
                
                {/* INPUT DE EQUIPAMIENTO */}
                <div className="d-flex gap-2 mb-3">
                    <input
                        type="text"
                        className="form-control"
                        value={nuevoItemEquipo}
                        onChange={(e) => setNuevoItemEquipo(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                agregarFila('equipo');
                            }
                        }}
                    />
                    {/* Botón AGREGAR - Dispara la creación de la fila completa */}
                    <button
                        type="button"
                        className="btn btn-primary px-3"
                        onClick={() => agregarFila('equipo')}
                        disabled={!nuevoItemEquipo.trim() && !nuevoItemBibliografia.trim()}
                    >
                        Agregar
                    </button>
                </div>

                {/* VISUALIZACIÓN: Lista de Equipamiento (Muestra los datos de la fila) */}
                <div>
                    {filas.map((fila, index) => (
                        fila.equipo.trim() !== '' && (
                            <div key={index} className="d-flex align-items-center mb-2 p-2 rounded-3 bg-light-subtle">
                                <span className="flex-grow-1">{fila.equipo}</span>
                                <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm ms-2"
                                    onClick={() => eliminarFila(index)}
                                    style={DELETE_BUTTON_STYLE}
                                >
                                    ×
                                </button>
                            </div>
                        )
                    ))}
                </div>
            </div>

            <div className="mb-4">
                <label className="form-label mb-3">
                    Bibliografía
                </label>
                
                {/* INPUT DE BIBLIOGRAFÍA */}
                <div className="d-flex gap-2 mb-3">
                    <input
                        type="text"
                        className="form-control"
                        value={nuevoItemBibliografia}
                        onChange={(e) => setNuevoItemBibliografia(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                agregarFila('bibliografia');
                            }
                        }}
                    />
                    {/* Botón AGREGAR - Dispara la creación de la fila completa */}
                    <button
                        type="button"
                        className="btn btn-primary px-3"
                        onClick={() => agregarFila('bibliografia')}
                        disabled={!nuevoItemEquipo.trim() && !nuevoItemBibliografia.trim()}
                    >
                        Agregar
                    </button>
                </div>

                {/* VISUALIZACIÓN: Lista de Bibliografía (Muestra los datos de la fila) */}
                <div>
                    {filas.map((fila, index) => (
                        fila.bibliografia.trim() !== '' && (
                            <div key={index} className="d-flex align-items-center mb-2 p-2 rounded-3 bg-light-subtle">
                                <span className="flex-grow-1">{fila.bibliografia}</span>
                                <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm ms-2"
                                    onClick={() => eliminarFila(index)}
                                    style={DELETE_BUTTON_STYLE}
                                >
                                    ×
                                </button>
                            </div>
                        )
                    ))}
                </div>
            </div>
        </Fragment>
    );
}