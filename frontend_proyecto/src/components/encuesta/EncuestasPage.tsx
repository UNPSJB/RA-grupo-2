import { useState, useEffect } from "react";
import EncuestasDisponibles from "./EncuestasDisponibles";
import EncuestasCompletadas from "./encuestasCompletadas/EncuestasCompletadas";
import { useObtenerEncuestasCompletadas } from "./encuestasCompletadas/ObtenerEncuestasCompletadas";

export default function EncuestasPage() {
  const alumnoId = 3;

  // ----- DISPONIBLES -----
  const [encuestasDisponibles, setEncuestasDisponibles] = useState<
    { materia: string; encuesta: string; materia_id: number; encuesta_id: number }[]
  >([]);

  useEffect(() => {
    const fetchDisponibles = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/alumnos/${alumnoId}/encuestas_disponibles`);
        if (!res.ok) throw new Error("Error al obtener encuestas disponibles");
        const data = await res.json();
        setEncuestasDisponibles(data);
      } catch (err) {
        console.error("Error:", err);
        setEncuestasDisponibles([]);
      }
    };
    fetchDisponibles();
  }, [alumnoId]);

  // ----- COMPLETADAS -----
  const { encuestas: encuestasCompletadas, loading, error } =
    useObtenerEncuestasCompletadas(alumnoId);

  // ----- RENDER -----
  return (
    <div className="container py-4">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h1 className="h4 mb-0">Gestión de Encuestas del Alumno {alumnoId}</h1>
        </div>

        <div className="card-body">
          {/* SECCIÓN: DISPONIBLES */}
          <section className="mb-4">
            <h2 className="h5 mb-3 text-secondary"> Encuestas pendientes</h2>
            {encuestasDisponibles.length === 0 ? (
              <p>No hay encuestas pendientes.</p>
            ) : (
              <EncuestasDisponibles encuestas={encuestasDisponibles} alumnoId={alumnoId} />
            )}
          </section>

          <hr />

          {/* SECCIÓN: COMPLETADAS */}
          <section className="mb-4">
            <h2 className="h5 mb-3 text-secondary"> Encuestas completadas</h2>
            {loading && <p>Cargando encuestas completadas...</p>}
            {error && <p className="text-danger">{error}</p>}
            {!loading && !error && (
              <EncuestasCompletadas encuestas={encuestasCompletadas} />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
