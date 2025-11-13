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
  JTP: string | null;
  aux1: string | null;
  aux2: string | null;
  periodo: string;
}

interface Props {
  docenteMateriaId: number;
  onDatosGenerados?: (datos: InformeActividad) => void;
  isReadOnly?: boolean;
  datosIniciales?: Partial<InformeActividad>;
  nombresFuncion?: { JTP: string; aux1: string; aux2: string };
  setNombresFuncion?: {
    SetJTP: React.Dispatch<React.SetStateAction<string>>;
    SetAux1: React.Dispatch<React.SetStateAction<string>>;
    SetAux2: React.Dispatch<React.SetStateAction<string>>;
  };
}

export default function CompletarInformeCatedraFuncion({
  docenteMateriaId,
  onDatosGenerados,
  isReadOnly = false,
  datosIniciales,
  nombresFuncion,
  setNombresFuncion,
}: Props) {
  const [data, setData] = useState<InformeActividad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cantidadComisionesTeoricas, setCantidadComisionesTeoricas] =
    useState(1);
  const [cantidadComisionesPracticas, setCantidadComisionesPracticas] =
    useState(1);
  const JTP = nombresFuncion?.JTP ?? "";
  const aux1 = nombresFuncion?.aux1 ?? "";
  const aux2 = nombresFuncion?.aux2 ?? "";

  useEffect(() => {
    if (isReadOnly) {
      if (datosIniciales && datosIniciales.actividadCurricular) {
        setData(datosIniciales as InformeActividad);
        setLoading(false);
      } else if (!datosIniciales) {
        setLoading(false);
      }
      return;
    }

    const fetchData = async () => {
      try {
        const relacionRes = await fetch(
          `http://127.0.0.1:8000/docentes/materia_relacion/${docenteMateriaId}`
        );
        if (!relacionRes.ok)
          throw new Error("Error al obtener la relación docente-materia");
        const relacion = await relacionRes.json();

        const docenteId = relacion.docente_id;
        const materiaIdRelacion = relacion.materia_id;
        const anio = relacion.anio ?? ANIO_ACTUAL;
        const periodo = relacion.periodo ?? PERIODO_ACTUAL;

        const materiaRes = await fetch(
          `http://127.0.0.1:8000/materias/${materiaIdRelacion}`
        );
        if (!materiaRes.ok) throw new Error("Error al obtener la materia");
        const materia = await materiaRes.json();

        const docenteRes = await fetch(
          `http://127.0.0.1:8000/docentes/${docenteId}`
        );
        if (!docenteRes.ok) throw new Error("Error al obtener el docente");
        const docente = await docenteRes.json();

        const alumnosRes = await fetch(
          `http://127.0.0.1:8000/alumnos/materia/${materiaIdRelacion}/cursantes?anio=${anio}&periodo=${periodo}`
        );
        if (!alumnosRes.ok) throw new Error("Error al obtener alumnos");
        const alumnos = await alumnosRes.json();

        const cantidadAlumnos = alumnos.length;

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
          JTP,
          aux1,
          aux2,
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
  }, [
    docenteMateriaId,
    cantidadComisionesTeoricas,
    cantidadComisionesPracticas,
    isReadOnly,
    datosIniciales,
    JTP,
    aux1,
    aux2,
  ]);

  if (loading) return <p>Cargando información de la cátedra...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!data) {
    return isReadOnly ? <p>Cargando...</p> : <p>No hay datos para mostrar.</p>;
  }

  return (
    <Fragment>
      <h5 className="text-dark fw-bold mb-3">Información de la Cátedra</h5>
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
        <div className="col-md-12">
          {isReadOnly ? (
            data.JTP?.trim() && (
              <div className="col-md-4">
                <p className="mb-1 text-muted small">JTP</p>
                <p>{data.JTP}</p>
              </div>
            )
          ) : (
            <>
              <label htmlFor="JTP" className="form-label">
                JTP
              </label>
              <input
                type="text"
                className="form-control"
                id="JTP"
                min="0"
                value={JTP}
                onChange={(e) => {
                  setNombresFuncion?.SetJTP(e.target.value);
                }}
              />
            </>
          )}
        </div>
        <div className="col-md-12">
          {isReadOnly ? (
            data.aux1?.trim() && (
              <div className="col-md-4">
                <p className="mb-1 text-muted small">Auxiliar de Primera</p>
                <p>{data.aux1}</p>
              </div>
            )
          ) : (
            <>
              <label htmlFor="aux1" className="form-label">
                Auxiliar de Primera
              </label>

              <input
                type="text"
                className="form-control"
                id="aux1"
                min="0"
                value={aux1}
                onChange={(e) => {
                  setNombresFuncion?.SetAux1(e.target.value);
                }}
              />
            </>
          )}
        </div>
        <div className="col-md-12">
          {isReadOnly ? (
            data.aux2?.trim() && (
              <div className="col-md-4">
                <p className="mb-1 text-muted small">Auxiliar de Segunda</p>
                <p>{data.aux2}</p>
              </div>
            )
          ) : (
            <>
              <label htmlFor="aux2" className="form-label">
                Auxiliar de Segunda
              </label>

              <input
                type="text"
                className="form-control"
                id="aux2"
                min="0"
                value={aux2}
                onChange={(e) => {
                  setNombresFuncion?.SetAux2(e.target.value);
                }}
              />
            </>
          )}
        </div>
      </div>

      <hr className="my-4" />

      <h5 className="text-dark fw-bold mb-3">Información de Comisiones</h5>
      <div className="row g-3">
        <div className="col-md-6">
          <label htmlFor="comisionesTeoricas" className="form-label">
            Comisiones Teóricas
          </label>

          {isReadOnly ? (
            <p className="form-control-plaintext ps-2 pt-0">
              {data?.cantidadComisionesTeoricas ?? "N/A"}
            </p>
          ) : (
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
          )}
        </div>
        <div className="col-md-6">
          <label htmlFor="comisionesPracticas" className="form-label">
            Comisiones Prácticas
          </label>

          {isReadOnly ? (
            <p className="form-control-plaintext ps-2 pt-0">
              {data?.cantidadComisionesPracticas ?? "N/A"}
            </p>
          ) : (
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
          )}
        </div>
      </div>
    </Fragment>
  );
}
