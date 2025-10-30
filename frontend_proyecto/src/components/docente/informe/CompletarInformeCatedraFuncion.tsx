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
  <div className="card border-light shadow-sm">
    <div className="card-body p-0">
      <table className="table table-borderless m-0">
        <tbody>
          {[
            { label: "Sede", value: data.sede },
            { label: "Ciclo Lectivo", value: data.cicloLectivo },
            { label: "Período", value: data.periodo },
            { label: "Actividad Curricular", value: data.actividadCurricular },
            { label: "Código", value: data.codigoActividadCurricular },
            { label: "Docente Responsable", value: data.docenteResponsable },
            { label: "Alumnos inscriptos", value: data.cantidadAlumnos },
          ].map((item, index) => (
            <tr key={index}>
              <td className="fw-bold" style={{ width: '35%', padding: '12px 16px' }}>
                {item.label}
              </td>
              <td style={{ padding: '12px 16px' }}>{item.value}</td>
            </tr>
          ))}
          
          <tr>
            <td className="fw-bold" style={{ padding: '12px 16px' }}>Comisiones teóricas</td>
            <td style={{ padding: '12px 16px' }}>
              <input
                type="text"
                className="form-control form-control-sm"
                value={cantidadComisionesTeoricas}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setCantidadComisionesTeoricas(value === "" ? 0 : Number(value));
                  }
                }}
                style={{ maxWidth: '120px' }}
              />
            </td>
          </tr>
          
          <tr>
            <td className="fw-bold" style={{ padding: '12px 16px' }}>Comisiones prácticas</td>
            <td style={{ padding: '12px 16px' }}>
              <input
                type="text"
                className="form-control form-control-sm"
                value={cantidadComisionesPracticas}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setCantidadComisionesPracticas(value === "" ? 0 : Number(value));
                  }
                }}
                style={{ maxWidth: '120px' }}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);
}