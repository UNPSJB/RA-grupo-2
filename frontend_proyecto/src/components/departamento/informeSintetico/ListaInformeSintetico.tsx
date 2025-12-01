import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { fetchInformes } from "../../informeSintetico/informesSinteticosCompletados/informesService";
import ROUTES from "../../../paths";
import type { Departamento } from "../../../types/types";
import { MostrarPeriodo } from "../../../constants";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";

interface Informe {
  id: number;
  titulo: string;
  anio: number;
  periodo: string;
}

function ListaInformeSintetico() {
  const [informes, setInformes] = useState<Informe[]>([]);
  const { currentUser } = useAuth();
  const id_dpto = currentUser?.departamento_id;
  const [departamento, setDepartamento] = useState<Departamento | null>(null);

  const [filtroAnio, setFiltroAnio] = useState<string>("");
  const [filtroPeriodo, setFiltroPeriodo] = useState<string>("");
  const [filtroTitulo, setFiltroTitulo] = useState<string>("");

  useEffect(() => {
    const departamentoId = id_dpto;
    
    if (departamentoId) {
        api.get(`/departamentos/${departamentoId}`)
          .then((res) => setDepartamento(res.data))
          .catch((err) => console.error(err));
          
        fetchInformes(departamentoId)
          .then(setInformes)
          .catch((err) => console.error(err));

    } else {
        setInformes([]);
        setDepartamento(null);
    }
  }, [id_dpto]);

  const opciones = useMemo(() => {
    const anios = Array.from(new Set(informes.map(i => i.anio))).sort((a, b) => b - a);
    const periodos = Array.from(new Set(informes.map(i => i.periodo)));

    let listaParaTitulos = informes;

    if (filtroAnio) {
        listaParaTitulos = listaParaTitulos.filter(i => i.anio.toString() === filtroAnio);
    }
    if (filtroPeriodo) {
        listaParaTitulos = listaParaTitulos.filter(i => i.periodo === filtroPeriodo);
    }

    const titulos = Array.from(new Set(listaParaTitulos.map(i => i.titulo))).sort();

    return { anios, periodos, titulos };
  }, [informes, filtroAnio, filtroPeriodo]);

  const informesFiltrados = useMemo(() => {
    return informes.filter(inf => {
      const matchAnio = filtroAnio ? inf.anio.toString() === filtroAnio : true;
      const matchPeriodo = filtroPeriodo ? inf.periodo === filtroPeriodo : true;
      const matchTitulo = filtroTitulo ? inf.titulo === filtroTitulo : true;

      return matchAnio && matchPeriodo && matchTitulo;
    });
  }, [informes, filtroAnio, filtroPeriodo, filtroTitulo]);

  const limpiarFiltros = () => {
    setFiltroAnio("");
    setFiltroPeriodo("");
    setFiltroTitulo("");
  };
  
  if (!departamento) {
    return (
      <div className="container py-4">
        <div className="alert alert-info">Cargando informes del departamento...</div>
      </div>
    );
  }

  if (id_dpto) return (
    <div className="container py-4">
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-unpsjb-header">
          <h1 className="h4 mb-0 text-white">Departamento de {departamento.nombre}</h1>
        </div>
        <div className="card-body">
          <h2 className="h5 mb-4">Informes Sintéticos Completados</h2>

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
                      setFiltroTitulo(""); 
                  }}
                >
                  <option value="">TODOS</option>
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
                      setFiltroTitulo("");
                  }}
                >
                  <option value="">TODOS</option>
                  {opciones.periodos.map(p => <option key={p} value={p}>{MostrarPeriodo(p)}</option>)}
                </select>
              </div>

              <div className="d-flex align-items-center">
                <label className="text-muted fw-bold small me-2 text-uppercase" style={{ fontSize: '0.75rem' }}>Informe / Carrera:</label>
                <select
                  className="form-select form-select-sm border-0 bg-white shadow-sm"
                  style={{ maxWidth: '300px', cursor: 'pointer' }}
                  value={filtroTitulo}
                  onChange={(e) => setFiltroTitulo(e.target.value)}
                  disabled={opciones.titulos.length === 0}
                >
                  <option value="">TODOS</option>
                  {opciones.titulos.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {(filtroAnio || filtroPeriodo || filtroTitulo) && (
                <button onClick={limpiarFiltros} className="btn btn-link text-danger p-0">
                  <i className="bi bi-x-circle-fill"></i>
                </button>
              )}
            </div>

            <div className="text-end mt-2 mt-md-0">
              <span className="text-muted fw-bold small text-uppercase" style={{ fontSize: '0.75rem' }}>COMPLETADOS:</span>
              <span className="ms-2 fs-5 fw-bold text-primary">{informesFiltrados.length}</span>
            </div>
          </div>

          {informesFiltrados.length === 0 ? (
             <div className="alert alert-info text-center">
                {informes.length === 0 
                  ? "No hay informes completados disponibles para este departamento." 
                  : "No se encontraron informes con los filtros seleccionados."}
             </div>
          ) : (
             <div className="list-group">
                {informesFiltrados.map((inf, i) => (
                <div key={inf.id} className="col-12 mb-3">
                    <div className="card shadow-sm border">
                        <div className="card-body d-flex justify-content-between align-items-center">
                            <div>
                                <span className="text-muted me-3">{i + 1}.</span>
                                <span className="fw-bold">
                                    {inf.titulo}
                                </span>
                                <span className="text-dark"> – {MostrarPeriodo(inf.periodo)} {inf.anio}</span>
                            </div>
                            <Link
                                to={ROUTES.INFORME_SINTETICO_DETALLE(inf.id)}
                                className="btn btn-theme-primary rounded-pill px-4"
                            >
                                Ver Informe
                            </Link>
                        </div>
                    </div>
                </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
  return null;
}

export default ListaInformeSintetico;