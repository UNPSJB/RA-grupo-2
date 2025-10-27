import { useEffect, useState } from "react";
import { ANIO_ACTUAL, PERIODO_ACTUAL } from "../../../constants";

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
  docenteMateriaId: number;
  onDatosGenerados?: (datos: InformeActividad) => void;
}

export default function InformeCatedraCompletadoFuncion({
  docenteMateriaId,
  onDatosGenerados,
}: Props) {
  const [data, setData] = useState<InformeActividad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cantidadComisionesTeoricas, setCantidadComisionesTeoricas] = useState(1);
  const [cantidadComisionesPracticas, setCantidadComisionesPracticas] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 🔹 Obtener docente_id y materia_id desde la relación intermedia
        const relacionRes = await fetch(
          `http://127.0.0.1:8000/docentes/materia_relacion/${docenteMateriaId}`
        );
        if (!relacionRes.ok) throw new Error("Error al obtener la relación docente-materia");
        const relacion = await relacionRes.json();

        const docenteId = relacion.docente_id;
        const materiaIdRelacion = relacion.materia_id;
        const anio = relacion.anio ?? ANIO_ACTUAL;
        const periodo = relacion.periodo ?? PERIODO_ACTUAL;

        // 🔹 Obtener la materia
        const materiaRes = await fetch(
          `http://127.0.0.1:8000/materias/${materiaIdRelacion}`
        );
        if (!materiaRes.ok) throw new Error("Error al obtener la materia");
        const materia = await materiaRes.json();

        // 🔹 Obtener el docente
        const docenteRes = await fetch(
          `http://127.0.0.1:8000/docentes/${docenteId}`
        );
        if (!docenteRes.ok) throw new Error("Error al obtener el docente");
        const docente = await docenteRes.json();

        // 🔹 Obtener alumnos según materia, año y periodo
        const alumnosRes = await fetch(
          `http://127.0.0.1:8000/alumnos/materia/${materiaIdRelacion}/cursantes?anio=${anio}&periodo=${periodo}`
        );
        if (!alumnosRes.ok) throw new Error("Error al obtener alumnos");
        const alumnos = await alumnosRes.json();

        const cantidadAlumnos = alumnos.length;

        // 🔹 Generar el informe
        const datos: InformeActividad = {
          sede: "Trelew",
          cicloLectivo: anio,
          periodo: periodo,
          actividadCurricular: materia.nombre,
          codigoActividadCurricular: materia.matricula,
          docenteResponsable: `${docente.nombre} ${docente.apellido}`,
          cantidadAlumnos,
          cantidadComisionesTeoricas,
          cantidadComisionesPracticas,
        };

        setData(datos);
        onDatosGenerados?.(datos);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [docenteMateriaId, cantidadComisionesTeoricas, cantidadComisionesPracticas]);

  if (loading) return <p>Cargando informe...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!data) return <p>No hay datos para mostrar.</p>;

  return (
    <div className="informe-container" style={{ width: "80%", margin: "0.5rem auto" }}>
      <table border={1} cellPadding={6} style={{ width: "100%", borderCollapse: "collapse", margin: 0 }}>
        <tbody>
          <tr><td><strong>Sede</strong></td><td>{data.sede}</td></tr>
          <tr><td><strong>Ciclo Lectivo</strong></td><td>{data.cicloLectivo}</td></tr>
          <tr><td><strong>Período</strong></td><td>{data.periodo}</td></tr>
          <tr><td><strong>Actividad Curricular</strong></td><td>{data.actividadCurricular}</td></tr>
          <tr><td><strong>Código de Actividad Curricular</strong></td><td>{data.codigoActividadCurricular}</td></tr>
          <tr><td><strong>Docente Responsable</strong></td><td>{data.docenteResponsable}</td></tr>
          <tr><td><strong>Cantidad de alumnos inscriptos</strong></td><td>{data.cantidadAlumnos}</td></tr>
          <tr>
            <td><strong>Cantidad de comisiones teóricas</strong></td>
            <td>
              <input
                type="text"
                value={cantidadComisionesTeoricas}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setCantidadComisionesTeoricas(value === "" ? 0 : Number(value));
                  }
                }}
                placeholder="Ingrese un número"
                style={{ width: "100%" }}
              />
            </td>
          </tr>
          <tr>
            <td><strong>Cantidad de comisiones prácticas</strong></td>
            <td>
              <input
                type="text"
                value={cantidadComisionesPracticas}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setCantidadComisionesPracticas(value === "" ? 0 : Number(value));
                  }
                }}
                placeholder="Ingrese un número"
                style={{ width: "100%" }}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
