import { useEffect, useState, Fragment } from "react";
//instancia api
import api from "../../../services/api";
import { ANIO_ACTUAL, PERIODO_ACTUAL, MostrarPeriodo } from "../../../constants";

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
  nombresFuncion?: { JTP: string | null; aux1: string | null; aux2: string | null };
  setNombresFuncion?: {
    SetJTP: React.Dispatch<React.SetStateAction<string>>;
    SetAux1: React.Dispatch<React.SetStateAction<string>>;
    SetAux2: React.Dispatch<React.SetStateAction<string>>;
  };
  cantidadesComisiones?: { teoricas: number; practicas: number };
  setCantidadesComisiones?: (tipo: 'teoricas' | 'practicas', valor: number) => void;
}

export default function CompletarInformeCatedraFuncion({
  docenteMateriaId,
  onDatosGenerados,
  isReadOnly = false,
  datosIniciales,
  nombresFuncion,
  setNombresFuncion,
  cantidadesComisiones,
  setCantidadesComisiones
}: Props) {
  const [data, setData] = useState<InformeActividad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [localJTP, setLocalJTP] = useState(nombresFuncion?.JTP || "");
  const [localAux1, setLocalAux1] = useState(nombresFuncion?.aux1 || "");
  const [localAux2, setLocalAux2] = useState(nombresFuncion?.aux2 || "");

  const [localTeoricas, setLocalTeoricas] = useState(
    (cantidadesComisiones?.teoricas !== undefined && cantidadesComisiones.teoricas !== -1)
      ? cantidadesComisiones.teoricas
      : 1
  );
  const [localPracticas, setLocalPracticas] = useState(
    (cantidadesComisiones?.practicas !== undefined && cantidadesComisiones.practicas !== -1)
      ? cantidadesComisiones.practicas
      : 1
  );

  useEffect(() => { setNombresFuncion?.SetJTP(localJTP); }, [localJTP, setNombresFuncion]);
  useEffect(() => { setNombresFuncion?.SetAux1(localAux1); }, [localAux1, setNombresFuncion]);
  useEffect(() => { setNombresFuncion?.SetAux2(localAux2); }, [localAux2, setNombresFuncion]);

  useEffect(() => {
    if (localTeoricas >= 0) setCantidadesComisiones?.('teoricas', localTeoricas);
  }, [localTeoricas, setCantidadesComisiones]);

  useEffect(() => {
    if (localPracticas >= 0) setCantidadesComisiones?.('practicas', localPracticas);
  }, [localPracticas, setCantidadesComisiones]);

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
        const relacionRes = await api.get(`/docentes/materia_relacion/${docenteMateriaId}`);
        const relacion = relacionRes.data;
        const docenteId = relacion.docente_id;
        const materiaIdRelacion = relacion.materia_id;
        const anio = relacion.anio ?? ANIO_ACTUAL;
        const periodo = relacion.periodo ?? PERIODO_ACTUAL;
        const materiaRes = await api.get(`/materias/${materiaIdRelacion}`);
        const materia = materiaRes.data;
        const docenteRes = await api.get(`/docentes/${docenteId}`);
        const docente = docenteRes.data;
        const alumnosRes = await api.get(`/alumnos/materia/${materiaIdRelacion}/cursantes`, {
          params: { anio, periodo }
        });
        const alumnos = alumnosRes.data;

        const cantidadAlumnos = alumnos.length;


        const datosBase: InformeActividad = {
          sede: materia.departamento?.sede?.nombre || "Sin asignar",
          cicloLectivo: anio,
          periodo: periodo,
          actividadCurricular: materia.nombre,
          codigoActividadCurricular: materia.matricula,
          docenteResponsable: `${docente.nombre} ${docente.apellido}`,
          cantidadAlumnos,
          cantidadComisionesTeoricas: 1,
          cantidadComisionesPracticas: 1,
          JTP: null,
          aux1: null,
          aux2: null,
        };

        setData(datosBase);
        onDatosGenerados?.(datosBase);

      } catch (err: any) {
        console.error("Error cargando datos de cátedra:", err);
        const msg = err.response?.data?.detail || err.message || "Error desconocido.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [docenteMateriaId, isReadOnly, datosIniciales]);


  if (loading) return <div className="d-flex justify-content-center p-5"><div className="spinner-border text-primary"></div></div>;
  if (error) return <p className="text-danger">Error: {error}</p>;
  if (!data) return isReadOnly ? <p>Cargando...</p> : <p>No hay datos.</p>;

  return (
    <Fragment>
      <h5 className="text-dark fw-bold mb-3">Información de la Cátedra</h5>
      <hr className="mb-4" />
      <div className="row g-3">
        <div className="col-md-4">
          <p className="mb-1 text-muted small">Materia</p>
          <p className="fw-medium">{data.actividadCurricular}</p>
        </div>
        <div className="col-md-4">
          <p className="mb-1 text-muted small">Código</p>
          <p className="fw-medium">{data.codigoActividadCurricular}</p>
        </div>
        <div className="col-md-4">
          <p className="mb-1 text-muted small">Sede</p>
          <p className="fw-medium">{data.sede}</p>
        </div>
        <div className="col-md-4">
          <p className="mb-1 text-muted small">Docente Responsable</p>
          <p className="fw-medium">{data.docenteResponsable}</p>
        </div>
        <div className="col-md-4">
          <p className="mb-1 text-muted small">Ciclo Lectivo</p>
          <p className="fw-medium">{data.cicloLectivo}</p>
        </div>
        <div className="col-md-4">
          <p className="mb-1 text-muted small">Período</p>
          <p className="fw-medium">{MostrarPeriodo(data.periodo)}</p>
        </div>
        <div className="col-md-4">
          <p className="mb-1 text-muted small">Alumnos Inscriptos</p>
          <p className="fw-medium">{data.cantidadAlumnos}</p>
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
              <label htmlFor="JTP" className="form-label">JTP</label>
              <input
                type="text"
                className="form-control"
                id="JTP"
                value={localJTP}
                onChange={(e) => setLocalJTP(e.target.value)}
                placeholder="Nombre del JTP"
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
              <label htmlFor="aux1" className="form-label">Auxiliar de Primera</label>
              <input
                type="text"
                className="form-control"
                id="aux1"
                value={localAux1}
                onChange={(e) => setLocalAux1(e.target.value)}
                placeholder="Nombre del Auxiliar 1ra"
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
              <label htmlFor="aux2" className="form-label">Auxiliar de Segunda</label>
              <input
                type="text"
                className="form-control"
                id="aux2"
                value={localAux2}
                onChange={(e) => setLocalAux2(e.target.value)}
                placeholder="Nombre del Auxiliar 2da"
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
            Comisiones Teóricas <span className="text-danger">*</span>
          </label>
          {isReadOnly ? (
            <p className="form-control-plaintext ps-2">{data?.cantidadComisionesTeoricas}</p>
          ) : (
            <input
              type="number"
              className="form-control"
              id="comisionesTeoricas"
              min="1"
              value={localTeoricas}
              onChange={(e) => setLocalTeoricas(parseInt(e.target.value) || 0)}
            />
          )}
        </div>
        <div className="col-md-6">
          <label htmlFor="comisionesPracticas" className="form-label">
            Comisiones Prácticas <span className="text-danger">*</span>
          </label>
          {isReadOnly ? (
            <p className="form-control-plaintext ps-2">{data?.cantidadComisionesPracticas}</p>
          ) : (
            <input
              type="number"
              className="form-control"
              id="comisionesPracticas"
              min="1"
              value={localPracticas}
              onChange={(e) => setLocalPracticas(parseInt(e.target.value) || 0)}
            />
          )}
        </div>
      </div>
    </Fragment>
  );
}