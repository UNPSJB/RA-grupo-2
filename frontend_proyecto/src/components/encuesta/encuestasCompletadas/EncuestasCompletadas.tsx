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

  if (loading) {
    return <p className="text-muted">Cargando...</p>;
  }

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  const encontrada = encuestas.find((e) => e.id === Number(id));

  if (!encontrada) {
    return <p className="text-muted">No se encontró la encuesta.</p>;
  }

  const detalle: EncuestaDetalle = {
    id: encontrada.id,
    materia: { nombre: encontrada.materia.nombre },
    encuesta: { nombre: encontrada.encuesta.nombre },
    anio: encontrada.anio,
    periodo: encontrada.periodo,
    respuestas: [] as Respuesta[],
  };

  return (
    <div className="container py-4">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h2 className="h5 mb-0">{detalle.encuesta.nombre}</h2>
          <small>
            {detalle.materia.nombre} — {detalle.anio} / {detalle.periodo}
          </small>
        </div>

        <div className="card-body">
          <h5 className="mb-3 fw-bold">Respuestas</h5>
          {detalle.respuestas.length > 0 ? (
            <ul className="list-group">
              {detalle.respuestas.map((r) => (
                <li key={r.id} className="list-group-item">
                  <strong>{r.pregunta.texto || "Pregunta desconocida"}</strong>
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
