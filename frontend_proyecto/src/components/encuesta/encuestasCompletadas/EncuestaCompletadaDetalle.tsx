import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useObtenerEncuestasCompletadas } from "./ObtenerEncuestasCompletadas";

type Pregunta = {
  id: number;
  texto: string;
};

type Respuesta = {
  id: number;
  pregunta: Pregunta;
  respuesta_texto: string | null;
};

type EncuestaDetalle = {
  id: number;
  materia: { nombre: string };
  encuesta: { nombre: string };
  anio: number;
  periodo: string;
  respuestas: Respuesta[];
};

export default function EncuestaCompletadaDetalle() {
  const { id } = useParams<{ id: string }>();
  const alumnoId = 3; 
  const { encuestas, loading: cargandoLista, error: errorLista } = useObtenerEncuestasCompletadas(alumnoId);

  const [detalle, setDetalle] = useState<EncuestaDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    if (cargandoLista) return;

    const encontrada = encuestas.find((e) => e.id === Number(id));

    if (encontrada) {
      setDetalle({
        id: encontrada.id,
        materia: { nombre: encontrada.materia.nombre },
        encuesta: { nombre: encontrada.encuesta.nombre },
        anio: encontrada.anio,
        periodo: encontrada.periodo,
        respuestas: [], // se pueden cargar después si hace falta
      });
    } else {
      setError("No se encontró la encuesta completada.");
    }

    setLoading(false);
  }, [id, encuestas, cargandoLista]);

  if (loading || cargandoLista) return <p className="text-muted">Cargando...</p>;
  if (error || errorLista) return <p className="text-danger">{error || errorLista}</p>;
  if (!detalle) return <p>No se encontró la encuesta.</p>;

  return (
    <div className="container py-4">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h2 className="h5 mb-0">{detalle.encuesta?.nombre}</h2>
          <small>
            {detalle.materia?.nombre} — {detalle.anio} / {detalle.periodo}
          </small>
        </div>

        <div className="card-body">
          <h5 className="mb-3 fw-bold">Respuestas</h5>
          {detalle.respuestas && detalle.respuestas.length > 0 ? (
            <ul className="list-group">
              {detalle.respuestas.map((r) => (
                <li key={r.id} className="list-group-item">
                  <strong>{r.pregunta?.texto || "Pregunta desconocida"}</strong>
                  <br />
                  <span className="text-muted">
                    {r.respuesta_texto || "Sin respuesta"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay respuestas registradas.</p>
          )}
        </div>

        <div className="card-footer text-end">
          <Link to="/encuestas" className="btn btn-primary btn-sm">
            ← Volver
          </Link>
        </div>
      </div>
    </div>
  );
}
