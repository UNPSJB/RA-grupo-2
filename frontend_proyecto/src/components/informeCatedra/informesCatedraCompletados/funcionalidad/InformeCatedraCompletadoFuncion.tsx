import { useEffect, useState } from "react";
import { ANIO_ACTUAL } from "../../../../constants";

interface InformeActividad {
  sede: string;
  cicloLectivo: number;
  actividadCurricular: string;
  codigoActividadCurricular: string;
  docenteResponsable: string;
  cantidadAlumnos: number;
  cantidadComisionesTeoricas: number;
  cantidadComisionesPracticas: number;
  periodo: string;
}

interface Props {
  docenteId: number;
  materiaId: number;
  informeId: number;
}

export default function InformeCatedraCompletadoFuncion({
  docenteId,
  materiaId,
  informeId,
}: Props) {
  const [data, setData] = useState<InformeActividad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1️⃣ Obtener el informe completado (incluye año y periodo)
        const informeRes = await fetch(
          `http://127.0.0.1:8000/informe-catedra-completado/${informeId}`
        );
        if (!informeRes.ok) throw new Error("Error al obtener el informe");
        const informe = await informeRes.json();

        const anio = informe.anio ?? ANIO_ACTUAL;
        const periodo = informe.periodo;
        if (!anio || !periodo)
          throw new Error("El informe no contiene año o periodo válidos.");

        // 2️⃣ Obtener la materia
        const materiaRes = await fetch(
          `http://127.0.0.1:8000/materias/${materiaId}`
        );
        if (!materiaRes.ok) throw new Error("Error al obtener la materia");
        const materia = await materiaRes.json();

        // 3️⃣ Obtener el docente
        const docenteRes = await fetch(
          `http://127.0.0.1:8000/docentes/${docenteId}`
        );
        if (!docenteRes.ok) throw new Error("Error al obtener el docente");
        const docente = await docenteRes.json();

        // 4️⃣ Obtener alumnos según materia, año y periodo
        const alumnosRes = await fetch(
          `http://127.0.0.1:8000/alumnos/materia/${materiaId}/cursantes?anio=${anio}&periodo=${periodo}`
        );
        if (!alumnosRes.ok) throw new Error("Error al obtener alumnos");
        const alumnos = await alumnosRes.json();

        const cantidadAlumnos = alumnos.length;

        // 5️⃣ Generar el informe para mostrar
        const sede = "Trelew";
        const cantidadComisionesTeoricas = 1;
        const cantidadComisionesPracticas = 2;

        setData({
          sede,
          cicloLectivo: anio,
          periodo,
          actividadCurricular: materia.nombre,
          codigoActividadCurricular: materia.matricula,
          docenteResponsable: `${docente.nombre} ${docente.apellido}`,
          cantidadAlumnos,
          cantidadComisionesTeoricas,
          cantidadComisionesPracticas,
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [docenteId, materiaId, informeId]);

  if (loading) return <p>Cargando informe...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!data) return <p>No hay datos para mostrar.</p>;

  return (
    <div className="informe-container" style={{ width: "80%", margin: "2rem auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
        Informe de Actividad Curricular
      </h2>

      <table border={1} cellPadding={6} style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr><td><strong>Sede</strong></td><td>{data.sede}</td></tr>
          <tr><td><strong>Ciclo Lectivo</strong></td><td>{data.cicloLectivo}</td></tr>
          <tr><td><strong>Período</strong></td><td>{data.periodo}</td></tr>
          <tr><td><strong>Actividad Curricular</strong></td><td>{data.actividadCurricular}</td></tr>
          <tr><td><strong>Código de Actividad Curricular</strong></td><td>{data.codigoActividadCurricular}</td></tr>
          <tr><td><strong>Docente Responsable</strong></td><td>{data.docenteResponsable}</td></tr>
          <tr><td><strong>Cantidad de alumnos inscriptos</strong></td><td>{data.cantidadAlumnos}</td></tr>
          <tr><td><strong>Cantidad de comisiones clases teóricas</strong></td><td>{data.cantidadComisionesTeoricas}</td></tr>
          <tr><td><strong>Cantidad de comisiones clases prácticas</strong></td><td>{data.cantidadComisionesPracticas}</td></tr>
        </tbody>
      </table>
    </div>
  );
}
