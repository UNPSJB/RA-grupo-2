  import { useState, useMemo } from "react";
  import type { Carrera, Departamento } from "../../types/types";
  import { Link } from "react-router-dom";
  import ROUTES from "../../paths";
  import { ANIO_ACTUAL, PERIODO_ACTUAL } from "../../constants";

  type Props = {
    carreras: Carrera[];
    departamento: Departamento;
  };

  function ListaCarreras({ carreras, departamento }: Props) {
    const [filtroCarrera, setFiltroCarrera] = useState<string>("");

    const opciones = useMemo(() => {
      if (!carreras) return [];
      return Array.from(new Set(carreras.map(c => c.nombre))).sort();
    }, [carreras]);

    const carrerasFiltradas = useMemo(() => {
      if (!carreras) return [];
      return carreras.filter(c => {
        return filtroCarrera ? c.nombre === filtroCarrera : true;
      });
    }, [carreras, filtroCarrera]);

    const limpiarFiltro = () => setFiltroCarrera("");

    if (!carreras || carreras.length === 0) {
      return <div className="alert alert-info text-center">No hay informes sintéticos pendientes</div>;
    }

    return (
      <div>
        <div className="d-flex flex-wrap align-items-center justify-content-between bg-light p-3 rounded-3 mb-4 border">
          <div className="d-flex align-items-center gap-3">
            
            <div className="d-flex align-items-center">
              <label className="text-muted fw-bold small me-2 text-uppercase" style={{ fontSize: '0.75rem' }}>Carreras:</label>
              <select
                className="form-select form-select-sm border-0 bg-white shadow-sm"
                style={{ maxWidth: '300px', cursor: 'pointer' }}
                value={filtroCarrera}
                onChange={(e) => setFiltroCarrera(e.target.value)}
              >
                <option value="">Todas</option>
                {opciones.map(nom => <option key={nom} value={nom}>{nom}</option>)}
              </select>
            </div>

            {filtroCarrera && (
              <button onClick={limpiarFiltro} className="btn btn-link text-danger p-0">
                <i className="bi bi-x-circle-fill"></i>
              </button>
            )}
          </div>

          <div className="text-end mt-2 mt-md-0">
            <span className="text-muted fw-bold small text-uppercase" style={{ fontSize: '0.75rem' }}>PENDIENTES:</span>
            <span className="ms-2 fs-5 fw-bold text-primary">{carrerasFiltradas.length}</span>
          </div>
        </div>

        {carrerasFiltradas.length === 0 ? (
          <div className="alert alert-info text-center">No se encontraron carreras con ese filtro.</div>
        ) : (
          <div className="list-group">
            {carrerasFiltradas.map((carrera, index) => (
              <div key={carrera.id} className="col-12 mb-3">
                <div className="card">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                      <span className="text-muted me-3">{index + 1}.</span>
                      <span className="fw-bold">{carrera.nombre}</span>
                    </div>
                    <Link
                      to={ROUTES.COMPLETAR_INFORME_SINTETICO}
                      state={{
                        dpto: departamento,
                        carrera: carrera,
                        anio: ANIO_ACTUAL,
                        periodo: PERIODO_ACTUAL,
                        informeBaseId: carrera.informe_base_id,
                      }}
                      className="btn btn-theme-primary rounded-pill px-6"
                    >
                      Completar Informe
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

  export default ListaCarreras;