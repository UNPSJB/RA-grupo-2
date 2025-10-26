import { useEffect, useState } from "react";

interface Pregunta {
  id: number;
  enunciado: string;
  categoria_id: number;
}

interface CategoriaConPreguntas {
  id: number;
  cod: string;
  texto: string;
  preguntas: Pregunta[];
}

interface Props {
  categoria: CategoriaConPreguntas;
  manejarCambio: (preguntaId: number, texto: string) => void;
  // Opcional: Si el informe requiere múltiples filas para el pedido de equipos
  // Por simplicidad, asumiremos que una fila representa una pregunta en la DB (Equipos, Bibliografia).
}

// Interfaz para gestionar las filas de la tabla de entrada
interface FilaPedido {
    id: number; // Índice local de la fila
    equipo_pregunta_id: number;
    bibliografia_pregunta_id: number;
    equipo_respuesta: string;
    bibliografia_respuesta: string;
}

export default function CategoriaEquipamiento({ categoria, manejarCambio }: Props) {
    // Las preguntas de equipos y bibliografía deben estar pre-cargadas manualmente en la DB
    // Asumiremos que la primera pregunta es "Equipamiento e insumos" y la segunda es "Bibliografía".
    
    // Filtramos las preguntas por sus enunciados (o IDs si se conocieran)
    const pEquipo = categoria.preguntas.find(p => p.enunciado.toLowerCase().includes("equipamiento"));
    const pBibliografia = categoria.preguntas.find(p => p.enunciado.toLowerCase().includes("bibliografia"));

    const [filas, setFilas] = useState<FilaPedido[]>([]);
    
    // Inicializar con 3 filas vacías si las preguntas existen
    useEffect(() => {
        if (pEquipo && pBibliografia && filas.length === 0) {
            const nuevasFilas: FilaPedido[] = [];
            for (let i = 0; i < 3; i++) {
                nuevasFilas.push({
                    id: i,
                    equipo_pregunta_id: pEquipo.id,
                    bibliografia_pregunta_id: pBibliografia.id,
                    equipo_respuesta: '',
                    bibliografia_respuesta: '',
                });
            }
            setFilas(nuevasFilas);
        }
    }, [categoria]);

    const actualizarFila = (filaId: number, campo: 'equipo' | 'bibliografia', valor: string) => {
        setFilas(prevFilas => {
            const nuevasFilas = prevFilas.map(fila => {
                if (fila.id === filaId) {
                    const preguntaId = campo === 'equipo' ? fila.equipo_pregunta_id : fila.bibliografia_pregunta_id;
                    
                    // Notificar al componente principal (CompletarInformeCatedra)
                    // Concatenamos las respuestas de todas las filas en un solo string
                    const nuevoValor = (campo === 'equipo' 
                        ? { ...fila, equipo_respuesta: valor } 
                        : { ...fila, bibliografia_respuesta: valor });
                    
                    const todasLasFilas = prevFilas.map(f => f.id === filaId ? nuevoValor : f);
                    
                    // Unir todas las respuestas de Equipos en una sola cadena (separadas por línea o ;)
                    const respuestaConsolidada = todasLasFilas.map(f => `${f.equipo_respuesta};${f.bibliografia_respuesta}`).join('\n');

                    // NOTA: Para un formulario tabular, es mejor que el componente principal tenga un endpoint
                    // específico para recibir esta estructura, pero para emular el patrón, mandamos
                    // todo el JSON/Texto al campo de la primera pregunta.

                    // Por simplicidad y para seguir el patrón de respuesta de texto de los otros CATs:
                    // Enviamos el texto al manejador principal (aunque solo se usa una columna)
                    manejarCambio(preguntaId, respuestaConsolidada);

                    return nuevoValor;
                }
                return fila;
            });
            return nuevasFilas;
        });
    };
    
    // Función para agregar una fila adicional
    const agregarFila = () => {
        const nuevoId = filas.length;
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
        return (
            <div className="alert alert-warning">
                Error: Las preguntas de Equipamiento o Bibliografía no fueron encontradas en la categoría.
            </div>
        );
    }
    
    // La fila 0 contiene el enunciado de la pregunta
    const enunciado = categoria.preguntas.find(p => p.enunciado.includes("1.-"))?.enunciado;

    return (
        <div className="card mt-3 shadow-sm">
            <div className="card-header bg-primary text-white">
                <strong>{categoria.cod} - {categoria.texto}</strong>
            </div>

            <div className="card-body">
                {enunciado && <p className="mb-3">{enunciado}</p>}

                <table className="table table-bordered m-0" style={{ borderCollapse: 'collapse' }}>
                    <thead className="table-light">
                        <tr>
                            <th style={{ width: "50%", padding: '8px', border: '1px solid #dee2e6' }}>Equipamiento e insumos</th>
                            <th style={{ width: "50%", padding: '8px', border: '1px solid #dee2e6' }}>Bibliografía</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filas.map((fila, index) => (
                            <tr key={fila.id}>
                                <td style={{ border: '1px solid #dee2e6' }}>
                                    <input
                                        type="text"
                                        className="form-control border-0"
                                        style={{ background: 'transparent' }}
                                        value={fila.equipo_respuesta}
                                        onChange={(e) => actualizarFila(fila.id, 'equipo', e.target.value)}
                                        placeholder={`Item ${index + 1}`}
                                    />
                                </td>
                                <td style={{ border: '1px solid #dee2e6' }}>
                                    <input
                                        type="text"
                                        className="form-control border-0"
                                        style={{ background: 'transparent' }}
                                        value={fila.bibliografia_respuesta}
                                        onChange={(e) => actualizarFila(fila.id, 'bibliografia', e.target.value)}
                                        placeholder={`Referencia ${index + 1}`}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                <div className="d-flex justify-content-end mt-2">
                    <button onClick={agregarFila} className="btn btn-outline-primary btn-sm">
                        + Agregar Fila
                    </button>
                </div>
            </div>
        </div>
    );
}