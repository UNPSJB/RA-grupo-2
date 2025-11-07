import { useEffect, useState, Fragment } from "react";
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

export default function CompletarInformeCatedraFuncion({
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

  if (loading) return <p>Cargando información de la cátedra...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!data) return <p>No hay datos para mostrar.</p>;

  return (
    <Fragment>
      <h5 className="text-dark fw-bold mb-3">
        Información de la Cátedra
      </h5>
      <hr className="mb-4" />
      <div className="row g-3">
        <div className="col-md-4">
          <p className="mb-1 text-muted small">Materia</p>
          <p>{data.actividadCurricular}</p>
        </div>
        <div className="col-md-4">
          <p className="mb-1 text-muted small">Código</p>
          <p>{data.codigoActividadCurricular}</p>
        </div>
        <div className="col-md-4">
          <p className="mb-1 text-muted small">Sede</p>
          <p>{data.sede}</p>
        </div>
        <div className="col-md-4">
          <p className="mb-1 text-muted small">Docente Responsable</p>
          <p>{data.docenteResponsable}</p>
        </div>
        <div className="col-md-4">
          <p className="mb-1 text-muted small">Ciclo Lectivo</p>
          <p>{data.cicloLectivo}</p>
        </div>
        <div className="col-md-4">
          <p className="mb-1 text-muted small">Período</p>
          <p>{data.periodo}</p>
        </div>
        <div className="col-md-4">
          <p className="mb-1 text-muted small">Alumnos Inscriptos</p>
          <p>{data.cantidadAlumnos}</p>
        </div>
      </div>
      
      <hr className="my-4" /> 
      
      <h5 className="text-dark fw-bold mb-3">
        Información de Comisiones
      </h5>
      <div className="row g-3">
        <div className="col-md-6">
          <label htmlFor="comisionesTeoricas" className="form-label">
            Comisiones Teóricas
          </label>
          <input
            type="number"
            className="form-control"
            id="comisionesTeoricas"
            min="0"
            value={cantidadComisionesTeoricas}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              setCantidadComisionesTeoricas(value);
            }}
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="comisionesPracticas" className="form-label">
            Comisiones Prácticas
          </label>
          <input
            type="number"
            className="form-control"
            id="comisionesPracticas"
            min="0"
            value={cantidadComisionesPracticas}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              setCantidadComisionesPracticas(value);
            }}
          />
        </div>
      </div>
    </Fragment> 
  );
}