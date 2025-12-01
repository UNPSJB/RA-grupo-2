import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../../../services/api";
import { MostrarPeriodo } from "../../../constants";
import type { Docente } from "../../../types/types";
import ROUTES from "../../../paths";
import { useAuth } from "../../../context/AuthContext";

interface InformeCatedraCompletado {
  id: number;
  titulo: string;
  anio: number;
  periodo: string;
  docente_materia_id: number;
  nombreMateriaRecuperado?: string; 
}

export default function InformeCatedraCompletadoDocente() {
  const [informes, setInformes] = useState<InformeCatedraCompletado[]>([]);
  const { currentUser } = useAuth();
  const docenteId = currentUser?.docente_id;
  const [docente, setDocente] = useState<Docente>();

  const [filtroAnio, setFiltroAnio] = useState<string>("");
  const [filtroPeriodo, setFiltroPeriodo] = useState<string>("");
  const [filtroMateria, setFiltroMateria] = useState<string>("");

  useEffect(() => {
    if (!docenteId) return;

    const cargarDatosIniciales = async () => {
      try {
        const [resDocente, resInformes] = await Promise.all([
          api.get(`/docentes/${docenteId}`),
          api.get(`/informe-catedra-completado/docente/${docenteId}/completados`)
        ]);
        
        setDocente(resDocente.data);
        setInformes(resInformes.data);
      } catch (error) {
        console.error("Error cargando informes:", error);
      }
    };
    cargarDatosIniciales();
  }, [docenteId]);

  useEffect(() => {
    if (informes.length === 0) return;

    const recuperarNombresMaterias = async () => {
      const informesActualizados = [...informes];
      let huboCambios = false;

      for (let i = 0; i < informesActualizados.length; i++) {
        const inf = informesActualizados[i];
        
        if (inf.nombreMateriaRecuperado || !inf.docente_materia_id) continue;

        try {
          const resRelacion = await api.get(`/docentes/materia_relacion/${inf.docente_materia_id}`);
          const materiaId = resRelacion.data.materia_id;

          if (materiaId) {
             const resMateria = await api.get(`/materias/${materiaId}`);
             informesActualizados[i] = { 
               ...inf, 
               nombreMateriaRecuperado: resMateria.data.nombre 
             };
             huboCambios = true;
          }
        } catch (error) {
          console.error(`Fallo recuperando materia para relacion ${inf.docente_materia_id}`, error);
        }
      }

      if (huboCambios) {
        setInformes(informesActualizados);
      }
    };

    recuperarNombresMaterias();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [informes.length]); 

  const opciones = useMemo(() => {
    const anios = Array.from(new Set(informes.map(inf => inf.anio))).sort((a, b) => b - a);
    const periodos = Array.from(new Set(informes.map(inf => inf.periodo)));
    const materias = Array.from(new Set(informes.map(inf => inf.nombreMateriaRecuperado).filter(Boolean))).sort();

    return { anios, periodos, materias };
  }, [informes]);

  const informesFiltrados = useMemo(() => {
    return informes.filter(inf => {
      const matchAnio = filtroAnio ? inf.anio.toString() === filtroAnio : true;
      const matchPeriodo = filtroPeriodo ? inf.periodo === filtroPeriodo : true;
      const matchMateria = filtroMateria ? inf.nombreMateriaRecuperado === filtroMateria : true;

      return matchAnio && matchPeriodo && matchMateria;
    }).sort((a, b) => {
       if (b.anio !== a.anio) return b.anio - a.anio;
       return a.periodo.localeCompare(b.periodo);
    });
  }, [informes, filtroAnio, filtroPeriodo, filtroMateria]);

  const limpiarFiltros = () => {
    setFiltroAnio("");
    setFiltroPeriodo("");
    setFiltroMateria("");
  };

  return (
    <div className="container py-4">
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-unpsjb-header">
          <h1 className="h4 mb-0 text-white">
            <strong>Docente:</strong> {docente?.nombre} {docente?.apellido}
          </h1>
        </div>
        
        <div className="card-body">
          <h2 className="h5 mb-4">Informes de Cátedra Completados</h2>

          <div className="d-flex flex-wrap align-items-center justify-content-between bg-light p-3 rounded-3 mb-4 border">
            <div className="d-flex flex-wrap align-items-center gap-4">
              
              <div className="d-flex align-items-center">
                <label className="text-muted fw-bold small me-2 text-uppercase" style={{fontSize: '0.75rem'}}>Año:</label>
                <select 
                  className="form-select form-select-sm border-0 bg-white shadow-sm" 
                  value={filtroAnio} onChange={e => setFiltroAnio(e.target.value)} style={{width: 'auto', cursor: 'pointer'}}>
                  <option value="">TODOS</option>
                  {opciones.anios.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              <div className="d-flex align-items-center">
                <label className="text-muted fw-bold small me-2 text-uppercase" style={{fontSize: '0.75rem'}}>Cuatrimestre:</label>
                <select 
                  className="form-select form-select-sm border-0 bg-white shadow-sm" 
                  value={filtroPeriodo} onChange={e => setFiltroPeriodo(e.target.value)} style={{width: 'auto', cursor: 'pointer'}}>
                  <option value="">TODOS</option>
                  {opciones.periodos.map(p => <option key={p} value={p}>{MostrarPeriodo(p)}</option>)}
                </select>
              </div>

              <div className="d-flex align-items-center">
                <label className="text-muted fw-bold small me-2 text-uppercase" style={{fontSize: '0.75rem'}}>Materia:</label>
                <select 
                  className="form-select form-select-sm border-0 bg-white shadow-sm" 
                  value={filtroMateria} onChange={e => setFiltroMateria(e.target.value)} 
                  style={{maxWidth: '200px', cursor: 'pointer'}}>
                  <option value="">TODAS</option>
                  {opciones.materias.map((m: any) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {(filtroAnio || filtroPeriodo || filtroMateria) && (
                <button onClick={limpiarFiltros} className="btn btn-link text-danger p-0"><i className="bi bi-x-circle-fill"></i></button>
              )}
            </div>
            <div className="text-end mt-2 mt-md-0">
               <span className="text-muted fw-bold small text-uppercase" style={{fontSize: '0.75rem'}}>ENCONTRADOS:</span>
               <span className="ms-2 fs-5 fw-bold text-primary">{informesFiltrados.length}</span>
            </div>
          </div>

          {informesFiltrados.length === 0 ? (
            <p className="text-muted text-center py-4">{informes.length === 0 ? "No hay informes." : "Sin resultados."}</p>
          ) : (
            <div className="list-group">
              {informesFiltrados.map((inf, i) => (
                <div key={inf.id} className="col-12 mb-3">
                  <div className="card shadow-sm border">
                    <div className="card-body d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-muted me-3">{i + 1}.</span>
                        <span className="fw-bold">{inf.titulo} – ({MostrarPeriodo(inf.periodo)})</span>
                      </div>
                      <Link to={ROUTES.INFORME_CATEDRA_COMPLETADO_DETALLE(inf.id)} className="btn btn-theme-primary rounded-pill px-4">Ver Detalle</Link>
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