import EncuestasCompletadas from "./EncuestasCompletadas";
import { useObtenerEncuestasCompletadas } from "./ObtenerEncuestasCompletadas";

export default function EncuestasCompletadasPage() {
  const alumnoId = 3; // hardcodeado por ahora
  const { encuestas, loading, error } = useObtenerEncuestasCompletadas(alumnoId);

  return (
    <div className="container py-4">
      <div className="card">
        <div className="card-header bg-success text-white">
          <h1 className="h4 mb-0">Encuestas Completadas</h1>
        </div>
        <div className="card-body">
          {loading && <p>Cargando...</p>}
          {error && <p className="text-danger">{error}</p>}
          {!loading && !error && <EncuestasCompletadas encuestas={encuestas} />}
        </div>
      </div>
    </div>
  );
}
