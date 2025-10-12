import { useMemo } from "react";
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
  const { encuestas, loading, error } = useObtenerEncuestasCompletadas(alumnoId);

  // Convertir id a number una sola vez y validar
  const idNum = id ? Number(id) : NaN;

  // useMemo con tipo de retorno explícito evita 'never'
  const detalle: EncuestaDetalle | null = useMemo<EncuestaDetalle | null>(() => {
    if (!id || loading || error) return null;
    if (isNaN(idNum)) return null;

    const encontrada = encuestas.find((e) => e.id === idNum);
    if (!encontrada) return null;

    return {
      id: encontrada.id,
      materia: { nombre: encontrada.materia.nombre },
      encuesta: { nombre: encontrada.encuesta.nombre },
      anio: encontrada.anio,
      periodo: encontrada.periodo,
      // ⚠️ casteamos el array vacío con el tipo correcto para evitar `never[]`
      respuestas: [] as Respuesta[],
    };
  }, [id, idNum, encuestas, loading, error]);

  const cargando = loading;
  const hayError = !!error;
  const noEncontrada = !detalle && !cargando && !hayError;

  if (cargando) return <p className="text-muted">Cargando...</p>;
  if (hayError) return <p className="text-danger">{error}</p>;
  if (noEncontrada) return <p>No se encontró la encuesta.</p>;

  // detalle ya es no-null en este punto (por los guards previos)
  return (
    <div className="container py-4">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h2 className="h5 mb-0">{detalle!.encuesta.nombre}</h2>
          <small>
            {detalle!.materia.nombre} — {detalle!.anio} / {detalle!.periodo}
          </small>
        </div>

        <div className="card-body">
          <h5 className="mb-3 fw-bold">Respuestas</h5>

          {detalle!.respuestas.length > 0 ? (
            <ul className="list-group">
              {detalle!.respuestas.map((r) => (
                <li key={r.id} className="list-group-item">
                  <strong>{r.pregunta?.texto ?? "Pregunta desconocida"}</strong>
                  <br />
                  <span className="text-muted">
                    {r.respuesta_texto ?? "Sin respuesta"}
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
