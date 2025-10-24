import { useEffect, useState } from "react";

interface Pregunta {
    id: number;
    enunciado: string;
    categoria_id: number;
}

interface Categoria {
    id: number;
    cod: string;
    texto: string;
}

interface Props {
    onTotalPreguntas?: (id: number, cantidad: number) => void;
    onRespuesta: (pregunta_id: number, texto: string) => void;
}

export default function Categoria2BInforme({ onTotalPreguntas, onRespuesta }: Props) {
    const [respuestas, setRespuestas] = useState<Record<number, string>>({});
    const [categoria, setCategoria] = useState<Categoria>();
    const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
    const [observacion, setObservacion] = useState<Pregunta | null>(null);

    useEffect(() => {
        const codigoDeseado = "2.B";
        const informeId = 3; // ID del informe de cátedra

        fetch(`http://localhost:8000/informes_catedra/${informeId}/categorias`)
            .then((res) => res.json())
            .then((todas: Categoria[]) => {
                const filtrada = todas.find((c) => c.cod === codigoDeseado);
                if (filtrada) setCategoria(filtrada);
            })
            .catch((err) => console.error("Error al obtener categorías:", err));
    }, []);

    useEffect(() => {
        if (categoria) {
            fetch(`http://localhost:8000/categorias/${categoria.id}/preguntas`)
                .then((res) => res.json())
                .then((data: Pregunta[]) => {
                    const obs = data.find((p) =>
                        p.enunciado.toLowerCase().includes("observaciones")
                    );
                    setObservacion(obs || null);

                    const sinObs = obs ? data.filter((p) => p.id !== obs.id) : data;
                    setPreguntas(sinObs);

                    const inicial: Record<number, string> = {};
                    data.forEach((p) => (inicial[p.id] = ""));
                    setRespuestas(inicial);

                    onTotalPreguntas?.(categoria.id, data.length);
                })
                .catch((err) =>
                    console.error("Error al obtener preguntas de la categoría:", err)
                );
        }
    }, [categoria, onTotalPreguntas]);

    const actualizarRespuestaTexto = (preguntaId: number, texto: string) => {
        setRespuestas((prev) => {
            const updated = { ...prev, [preguntaId]: texto };
            onRespuesta(preguntaId, texto);
            return updated;
        });
    };

    if (!categoria) return <div>Cargando categoría...</div>;

    return (
        <div className="card mt-3">
            <div className="card-header bg-primary text-white">
                <strong>
                    {categoria.cod} - {categoria.texto}
                </strong>
            </div>

            <div className="card-body p-0">
                <table className="table table-bordered m-0">
                    <thead className="table-light">
                        <tr>
                            <th style={{ width: "70%" }}>Grupo-Denominación</th>
                            <th style={{ width: "30%" }}>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {preguntas.map((p) => (
                            <tr key={p.id}>
                                <td>{p.enunciado}</td>
                                <td>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={respuestas[p.id] || ""}
                                        onChange={(e) => actualizarRespuestaTexto(p.id, e.target.value)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {observacion && (
                <div className="card-footer bg-light">
                    <label className="form-label fw-bold">
                        {observacion.enunciado}
                    </label>
                    <textarea
                        className="form-control"
                        rows={3}
                        value={respuestas[observacion.id] || ""}
                        onChange={(e) => actualizarRespuestaTexto(observacion.id, e.target.value)}
                    ></textarea>
                </div>
            )}
        </div>
    );
}
