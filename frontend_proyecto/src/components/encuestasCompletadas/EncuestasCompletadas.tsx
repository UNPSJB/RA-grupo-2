import { useState, useEffect, useMemo } from "react";
import type { Materia } from "../../types/types";
import { Link } from "react-router-dom";
import ROUTES from "../../paths";
import { MostrarPeriodo } from "../../constants";
import api from "../../services/api";

type Respuesta = {
  id: number;
  pregunta_id: number;
  opcion_id: number[];
  texto_respuesta: string;
  encuesta_completada_id: number;
};

type EncuestaCompletada = {
  id: number;
  alumno_id: number;
  encuesta_id: number;
  materia_id: number;
  anio: number;
  periodo: string;
  respuestas: Respuesta[];
};

type Props = {
  encuestas: EncuestaCompletada[];
};

export default function EncuestasCompletadas({ encuestas }: Props) {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [filtroAnio, setFiltroAnio] = useState<string>("");
  const [filtroPeriodo, setFiltroPeriodo] = useState<string>("");
  const [filtroMateria, setFiltroMateria] = useState<string>("");

  useEffect(() => {
    api
      .get("/materias")
      .then((res) => {
        setMaterias(res.data as Materia[]);
      })
      .catch((err) => {
        console.error(err);
        setMaterias([]);
      });
  }, [encuestas]);

  const encuestasProcesadas = useMemo(() => {
    return encuestas.map(e => ({
      ...e,
      nombreMateria: materias.find((m) => m.id === e.materia_id)?.nombre || "Materia desconocida"
    }));
  }, [encuestas, materias]);

  const opciones = useMemo(() => {
    const anios = Array.from(new Set(encuestasProcesadas.map(e => e.anio))).sort((a, b) => b - a);
    const periodos = Array.from(new Set(encuestasProcesadas.map(e => e.periodo)));

    let listaParaMaterias = encuestasProcesadas;

    if (filtroAnio) {
        listaParaMaterias = listaParaMaterias.filter(e => e.anio.toString() === filtroAnio);
    }
    if (filtroPeriodo) {
        listaParaMaterias = listaParaMaterias.filter(e => e.periodo === filtroPeriodo);
    }

    const nomsMaterias = Array.from(new Set(listaParaMaterias.map(e => e.nombreMateria))).sort();

    return { anios, periodos, nomsMaterias };
  }, [encuestasProcesadas, filtroAnio, filtroPeriodo]);

  const encuestasFiltradas = useMemo(() => {
    return encuestasProcesadas.filter(e => {
      const matchAnio = filtroAnio ? e.anio.toString() === filtroAnio : true;
      const matchPeriodo = filtroPeriodo ? e.periodo === filtroPeriodo : true;
      const matchMateria = filtroMateria ? e.nombreMateria === filtroMateria : true;

      return matchAnio && matchPeriodo && matchMateria;
    });
  }, [encuestasProcesadas, filtroAnio, filtroPeriodo, filtroMateria]);

  const limpiarFiltros = () => {
    setFiltroAnio("");
    setFiltroPeriodo("");
    setFiltroMateria("");
  };

  return (
    <div>
      <div className="d-flex flex-wrap align-items-center justify-content-between bg-light p-3 rounded-3 mb-4 border">
        <div className="d-flex flex-wrap align-items-center gap-4">
          
          <div className="d-flex align-items-center">
            <label className="text-muted fw-bold small me-2 text-uppercase" style={{ fontSize: '0.75rem' }}>Año:</label>
            <select
              className="form-select form-select-sm border-0 bg-white shadow-sm"
              style={{ width: 'auto', cursor: 'pointer' }}
              value={filtroAnio}
              onChange={(e) => {
                  setFiltroAnio(e.target.value);
                  setFiltroMateria(""); 
              }}
            >
              <option value="">Todos</option>
              {opciones.anios.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div className="d-flex align-items-center">
            <label className="text-muted fw-bold small me-2 text-uppercase" style={{ fontSize: '0.75rem' }}>Cuatrimestre:</label>
            <select
              className="form-select form-select-sm border-0 bg-white shadow-sm"
              style={{ width: 'auto', cursor: 'pointer' }}
              value={filtroPeriodo}
              onChange={(e) => {
                  setFiltroPeriodo(e.target.value);
                  setFiltroMateria("");
              }}
            >
              <option value="">Todos</option>
              {opciones.periodos.map(p => <option key={p} value={p}>{MostrarPeriodo(p)}</option>)}
            </select>
          </div>

          <div className="d-flex align-items-center">
            <label className="text-muted fw-bold small me-2 text-uppercase" style={{ fontSize: '0.75rem' }}>Materia:</label>
            <select
              className="form-select form-select-sm border-0 bg-white shadow-sm"
              style={{ maxWidth: '250px', cursor: 'pointer' }}
              value={filtroMateria}
              onChange={(e) => setFiltroMateria(e.target.value)}
              disabled={opciones.nomsMaterias.length === 0}
            >
              <option value="">Todos</option>
              {opciones.nomsMaterias.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {(filtroAnio || filtroPeriodo || filtroMateria) && (
            <button onClick={limpiarFiltros} className="btn btn-link text-danger p-0">
              <i className="bi bi-x-circle-fill"></i>
            </button>
          )}
        </div>

        <div className="text-end mt-2 mt-md-0">
          <span className="text-muted fw-bold small text-uppercase" style={{ fontSize: '0.75rem' }}>COMPLETADAS:</span>
          <span className="ms-2 fs-5 fw-bold text-primary">{encuestasFiltradas.length}</span>
        </div>
      </div>

      {encuestasFiltradas.length === 0 ? (
        <p className="text-muted text-center py-3">
          {encuestas.length === 0 ? "No ha completado encuestas." : "No hay encuestas con los filtros seleccionados."}
        </p>
      ) : (
        <div className="list-group">
          {encuestasFiltradas.map((e, i) => (
            <div key={i} className="col-12 mb-3">
              <div className="card">
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted me-2">{i + 1}.</span>
                    <span className="fw-bold">
                      {e.nombreMateria}
                    </span>

                    <span className="text-dark">
                      {" "}
                      — {e.anio} {MostrarPeriodo(e.periodo)}
                    </span>
                  </div>
                  <Link
                    to={ROUTES.ENCUESTA_COMPLETADA_DETALLE(e.id)}
                    className="btn btn-theme-primary rounded-pill px-6"
                  >
                    Ver encuesta
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}