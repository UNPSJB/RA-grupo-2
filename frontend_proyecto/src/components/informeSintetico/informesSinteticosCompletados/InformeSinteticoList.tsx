import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { fetchInformes } from "./informesService";
import ROUTES from "../../../paths";
import { MostrarPeriodo } from "../../../constants";

interface Informe {
  id: number;
  titulo: string;
  anio: number;
  periodo: string;
}

function InformeSinteticoList() {
  const [informes, setInformes] = useState<Informe[]>([]);
  
  const [filtroAnio, setFiltroAnio] = useState<string>("");
  const [filtroPeriodo, setFiltroPeriodo] = useState<string>("");
  const [filtroTitulo, setFiltroTitulo] = useState<string>("");

  useEffect(() => {
    fetchInformes().then(setInformes);
  }, []);

  const opciones = useMemo(() => {
    const anios = Array.from(new Set(informes.map(i => i.anio))).sort((a, b) => b - a);
    const periodos = Array.from(new Set(informes.map(i => i.periodo)));
    return { anios, periodos };
  }, [informes]);

  const informesFiltrados = useMemo(() => {
    return informes.filter(inf => {
      const matchAnio = filtroAnio ? inf.anio.toString() === filtroAnio : true;
      const matchPeriodo = filtroPeriodo ? inf.periodo === filtroPeriodo : true;
      
      const matchTitulo = filtroTitulo 
        ? inf.titulo.toLowerCase().includes(filtroTitulo.toLowerCase()) 
        : true;

      return matchAnio && matchPeriodo && matchTitulo;
    }).sort((a, b) => {
       if (b.anio !== a.anio) return b.anio - a.anio;
       return a.periodo.localeCompare(b.periodo);
    });
  }, [informes, filtroAnio, filtroPeriodo, filtroTitulo]);

  const limpiarFiltros = () => {
    setFiltroAnio("");
    setFiltroPeriodo("");
    setFiltroTitulo("");
  };

  return (
    <div className="container py-4">
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-unpsjb-header">
          <h1 className="h4 mb-0 text-white">Secretaría académica</h1>
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
                  onChange={(e) => setFiltroAnio(e.target.value)}
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
                  onChange={(e) => setFiltroPeriodo(e.target.value)}
                >
                  <option value="">TODOS</option>
                  {opciones.periodos.map(p => <option key={p} value={p}>{MostrarPeriodo(p)}</option>)}
                </select>
              </div>

              <div className="d-flex align-items-center">
                <label className="text-muted fw-bold small me-2 text-uppercase" style={{ fontSize: '0.75rem' }}>Título / Carrera:</label>
                
                <input
                    type="text"
                    className="form-control form-select-sm border-0 bg-white shadow-sm ps-3"
                    style={{ maxWidth: '250px' }}
                    placeholder="Buscar..."
                    value={filtroTitulo}
                    onChange={(e) => setFiltroTitulo(e.target.value)}
                    disabled={informes.length === 0}
                />
              </div>

              {(filtroAnio || filtroPeriodo || filtroTitulo) && (
                <button onClick={limpiarFiltros} className="btn btn-link text-danger p-0">
                  <i className="bi bi-x-circle-fill"></i>
                </button>
              )}
            </div>

            <div className="text-end mt-2 mt-md-0">
              <span className="text-muted fw-bold small text-uppercase" style={{ fontSize: '0.75rem' }}>ENCONTRADOS:</span>
              <span className="ms-2 fs-5 fw-bold text-primary">{informesFiltrados.length}</span>
            </div>
          </div>

          {informesFiltrados.length === 0 ? (
             <div className="alert alert-info text-center">
                {informes.length === 0 
                  ? "No hay informes completados disponibles." 
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
                        to={ROUTES.INFORME_SINTETICO_DETALLE_SECRETARIA(inf.id)}
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
}

export default InformeSinteticoList;