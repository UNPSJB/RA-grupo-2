import { useEffect, useState } from "react";

type Materia = {
  id: number;
  nombre: string;
};

type Encuesta = {
  id: number;
  nombre: string;
};

export type EncuestaCompletada = {
  id: number;
  materia: Materia;
  encuesta: Encuesta;
  anio: number;
  periodo: string;
};

export function useObtenerEncuestasCompletadas(alumnoId: number) {
  const [encuestas, setEncuestas] = useState<EncuestaCompletada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEncuestas = async () => {
      setLoading(true);
      try {
        // Traje la lista de encuestas completadas
        const res = await fetch(`http://127.0.0.1:8000/encuesta-completada/alumno/${alumnoId}`);
        if (!res.ok) throw new Error("Error al obtener encuestas completadas");
        const data = await res.json();

        // Para cada encuesta completada, traigo su materia y encuesta asociada
        const resultados: EncuestaCompletada[] = await Promise.all(
          data.map(async (item: any) => {
            try {
              const [materiaRes, encuestaRes] = await Promise.all([
                fetch(`http://127.0.0.1:8000/materias/${item.materia_id}`),
                fetch(`http://127.0.0.1:8000/encuestas/${item.encuesta_id}`)
              ]);

            const materia = materiaRes.ok ? await materiaRes.json() : { id: item.materia_id, nombre: "Desconocida" };
            const encuesta = encuestaRes.ok ? await encuestaRes.json() : { id: item.encuesta_id, nombre: "Desconocida" };

              return {
                id: item.id,  
                materia,
                encuesta,
                anio: item.anio,
                periodo: item.periodo,
              };
            } catch (innerErr) {
              console.error("Error cargando materia o encuesta:", innerErr);
              return {
                id: item.id,
                materia: { id: item.materia_id, nombre: "Error al cargar" },
                encuesta: { id: item.encuesta_id, nombre: "Error al cargar" },
                anio: item.anio,
                periodo: item.periodo,
              };
            }
          })
        );

        console.log(" Encuestas completadas procesadas:", resultados);
        setEncuestas(resultados);
        setError(null);
      } catch (err: any) {
        console.error("Error general:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEncuestas();
  }, [alumnoId]);

  return { encuestas, loading, error };
}
