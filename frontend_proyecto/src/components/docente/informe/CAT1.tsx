import { useState, useEffect, useMemo } from "react";

type RespuestaValor = {
  opcion_id: number | null;
  texto_respuesta: string | null;
};
interface Pregunta { id: number; enunciado: string; categoria_id: number; }
interface CategoriaConPreguntas { cod: string; texto: string; preguntas: Pregunta[]; id: number; }
interface Props {
  categoria: CategoriaConPreguntas;
  manejarCambio: (preguntaId: number, valor: RespuestaValor) => void;
}interface FilaPedido {
    id: number;
    equipo_pregunta_id: number;
    bibliografia_pregunta_id: number;
    equipo_respuesta: string;
    bibliografia_respuesta: string;
}


export default function CategoriaEquipamiento({ categoria, manejarCambio }: Props) {
    const pEquipo = useMemo(() => categoria.preguntas.find(p => p.enunciado.toLowerCase().includes("equipamiento")), [categoria.preguntas]);
    const pBibliografia = useMemo(() => categoria.preguntas.find(p => p.enunciado.toLowerCase().includes("bibliografia")), [categoria.preguntas]);

    const [filas, setFilas] = useState<FilaPedido[]>([]);
    const [enunciadoCompleto, setEnunciadoCompleto] = useState("");

    const consolidarRespuestas = (filas: FilaPedido[], campo: 'equipo' | 'bibliografia'): string => {
        return filas.map(f => campo === 'equipo' ? f.equipo_respuesta : f.bibliografia_respuesta)
                    .filter(txt => txt.trim() !== '')
                    .join('\n');
    };

    const enviarRespuestasAlPadre = (currentFilas: FilaPedido[]) => {
        if (pEquipo) {
            const equipoConsolidado = consolidarRespuestas(currentFilas, 'equipo');
            manejarCambio(pEquipo.id, {
                opcion_id: null,
                texto_respuesta: equipoConsolidado,
            });
        }
        if (pBibliografia) {
            const biblioConsolidada = consolidarRespuestas(currentFilas, 'bibliografia');
            manejarCambio(pBibliografia.id, {
                opcion_id: null,
                texto_respuesta: biblioConsolidada,
            });
        }
    };
    
    useEffect(() => {
        if (!pEquipo || !pBibliografia) return;

        const fullEnunciado = categoria.preguntas.find(p => p.enunciado.includes("1.-"))?.enunciado || "";
        setEnunciadoCompleto(fullEnunciado.replace(/ Equipamiento e insumos| Bibliografía/g, '').trim());

        if (filas.length === 0) {
            const nuevasFilas: FilaPedido[] = [];
            for (let i = 0; i < 3; i++) {
                nuevasFilas.push({ id: i, equipo_pregunta_id: pEquipo.id, bibliografia_pregunta_id: pBibliografia.id, equipo_respuesta: '', bibliografia_respuesta: '' });
            }
            setFilas(nuevasFilas);
        }
    }, [categoria, pEquipo, pBibliografia]);


    const actualizarFila = (filaId: number, campo: 'equipo' | 'bibliografia', valor: string) => {
        setFilas(prevFilas => {
            const nuevasFilas = prevFilas.map(fila => {
                if (fila.id === filaId) {
                    return campo === 'equipo' 
                        ? { ...fila, equipo_respuesta: valor } 
                        : { ...fila, bibliografia_respuesta: valor };
                }
                return fila;
            });
            enviarRespuestasAlPadre(nuevasFilas);
            return nuevasFilas;
        });
    };
    
    const agregarFila = () => {
        const nuevoId = filas.length ? filas[filas.length - 1].id + 1 : 0;
        if (pEquipo && pBibliografia) {
            setFilas(prev => [...prev, {
                id: nuevoId,
                equipo_pregunta_id: pEquipo.id,
                bibliografia_pregunta_id: pBibliografia.id,
                equipo_respuesta: '',
                bibliografia_respuesta: '',
            }]);
        }
    };

    if (!pEquipo || !pBibliografia) {
        return <div className="alert alert-warning mt-3">Error: Preguntas de Equipamiento o Bibliografía no asociadas correctamente a esta categoría.</div>;
    }
    
    return (
        <div className="card mt-3">
            <div className="card-header bg-primary text-white">
                <strong>{categoria.cod} - {categoria.texto}</strong>
            </div>

            <div className="card-body p-0">
                
                <p className="p-3 mb-0">
                    {enunciadoCompleto}
                </p>

                <div className="table-responsive">
                    <table className="table table-bordered m-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                <th className="text-center" style={{ width: '50%' }}>Equipamiento e insumos</th>
                                <th className="text-center" style={{ width: '50%' }}>Bibliografía</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filas.map((fila) => (
                                <tr key={fila.id}>
                                    <td className="p-0">
                                        <textarea
                                            className="form-control border-0"
                                            rows={3}
                                            style={{ background: 'transparent', resize: 'none' }}
                                            value={fila.equipo_respuesta}
                                            onChange={(e) => actualizarFila(fila.id, 'equipo', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-0">
                                        <textarea
                                            className="form-control border-0"
                                            rows={3}
                                            style={{ background: 'transparent', resize: 'none' }}
                                            value={fila.bibliografia_respuesta}
                                            onChange={(e) => actualizarFila(fila.id, 'bibliografia', e.target.value)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="card-footer bg-light d-flex justify-content-end">
                    <button onClick={agregarFila} className="btn btn-outline-primary btn-sm">
                        + Agregar Fila
                    </button>
                </div>
            </div>
        </div>
    );
}