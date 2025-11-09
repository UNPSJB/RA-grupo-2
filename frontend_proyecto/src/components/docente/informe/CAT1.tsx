import { useState, useMemo, Fragment } from "react";

type RespuestaValor = {
  opcion_id: number | null;
  texto_respuesta: string | null;
};

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
  manejarCambio: (preguntaId: number, valor: RespuestaValor) => void;
}

export default function CategoriaEquipamiento({ categoria, manejarCambio }: Props) {
    const pEquipo = useMemo(() => 
      categoria.preguntas.find(p => p.enunciado.toLowerCase().includes("equipamiento")), 
      [categoria.preguntas]
    );
    
    const pBibliografia = useMemo(() => 
      categoria.preguntas.find(p => p.enunciado.toLowerCase().includes("bibliografia")), 
      [categoria.preguntas]
    );

    const [itemsEquipo, setItemsEquipo] = useState<string[]>([]);
    const [itemsBibliografia, setItemsBibliografia] = useState<string[]>([]);
    const [nuevoItemEquipo, setNuevoItemEquipo] = useState("");
    const [nuevoItemBibliografia, setNuevoItemBibliografia] = useState("");

    const enviarRespuestasAlPadre = (equipoItems: string[], biblioItems: string[]) => {
        if (pEquipo) {
            const equipoConsolidado = equipoItems.filter(item => item.trim() !== '').join('\n');
            manejarCambio(pEquipo.id, {
                opcion_id: null,
                texto_respuesta: equipoConsolidado,
            });
        }
        if (pBibliografia) {
            const biblioConsolidada = biblioItems.filter(item => item.trim() !== '').join('\n');
            manejarCambio(pBibliografia.id, {
                opcion_id: null,
                texto_respuesta: biblioConsolidada,
            });
        }
    };

    const agregarItemEquipo = () => {
        if (nuevoItemEquipo.trim() !== '') {
            const nuevosItems = [...itemsEquipo, nuevoItemEquipo];
            setItemsEquipo(nuevosItems);
            setNuevoItemEquipo("");
            enviarRespuestasAlPadre(nuevosItems, itemsBibliografia);
        }
    };

    const agregarItemBibliografia = () => {
        if (nuevoItemBibliografia.trim() !== '') {
            const nuevosItems = [...itemsBibliografia, nuevoItemBibliografia];
            setItemsBibliografia(nuevosItems);
            setNuevoItemBibliografia("");
            enviarRespuestasAlPadre(itemsEquipo, nuevosItems);
        }
    };

    const eliminarItemEquipo = (index: number) => {
        const nuevosItems = itemsEquipo.filter((_, i) => i !== index);
        setItemsEquipo(nuevosItems);
        enviarRespuestasAlPadre(nuevosItems, itemsBibliografia);
    };

    const eliminarItemBibliografia = (index: number) => {
        const nuevosItems = itemsBibliografia.filter((_, i) => i !== index);
        setItemsBibliografia(nuevosItems);
        enviarRespuestasAlPadre(itemsEquipo, nuevosItems);
    };

    if (!pEquipo || !pBibliografia) {
        return <div className="alert alert-warning">Error: Preguntas no asociadas correctamente.</div>;
    }

    return (
        <Fragment>
            <div className="mb-4">
                <label className="form-label mb-3"> 
                    Equipamiento e insumos
                </label>
                
                <div className="d-flex gap-2 mb-3">
                    <input
                        type="text"
                        className="form-control"
                        value={nuevoItemEquipo}
                        onChange={(e) => setNuevoItemEquipo(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                agregarItemEquipo();
                            }
                        }}
                    />
                    <button
                        type="button"
                        className="btn btn-primary px-3"
                        onClick={agregarItemEquipo}
                        disabled={!nuevoItemEquipo.trim()}
                    >
                        Agregar
                    </button>
                </div>

                <div>
                    {itemsEquipo.map((item, index) => (
                        <div key={index} className="d-flex align-items-center mb-2 p-2 rounded-3 bg-light-subtle">
                            <span className="flex-grow-1">{item}</span>
                            <button
                                type="button"
                                className="btn btn-outline-danger btn-sm ms-2"
                                onClick={() => eliminarItemEquipo(index)}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mb-4">
                <label className="form-label mb-3">
                    Bibliografía
                </label>
                
                <div className="d-flex gap-2 mb-3">
                    <input
                        type="text"
                        className="form-control"
                        value={nuevoItemBibliografia}
                        onChange={(e) => setNuevoItemBibliografia(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                agregarItemBibliografia();
                            }
                        }}
                    />
                    <button
                        type="button"
                        className="btn btn-primary px-3"
                        onClick={agregarItemBibliografia}
                        disabled={!nuevoItemBibliografia.trim()}
                    >
                        Agregar
                    </button>
                </div>

                <div>
                    {itemsBibliografia.map((item, index) => (
                        <div key={index} className="d-flex align-items-center mb-2 p-2 rounded-3 bg-light-subtle">
                            <span className="flex-grow-1">{item}</span>
                            <button
                                type="button"
                                className="btn btn-outline-danger btn-sm ms-2"
                                onClick={() => eliminarItemBibliografia(index)}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </Fragment>
    );
}