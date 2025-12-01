import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// instancia api
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import { ANIO_ACTUAL } from "../../../constants";
import { PERIODO_ACTUAL, MostrarPeriodo } from "../../../constants";
import ROUTES from "../../../paths";
import { EsPeriodoInformeCatedra } from "../../secretaria/definirFechas/EstamosEnPeriodo"
import PopupPeriodoCerrado from "../../secretaria/definirFechas/PopUpPeriodo"
import { useTeacherData } from "../../../hooks/useTeacherData"; 

type InformePendiente = {
  materia_id: number;
  materia_nombre: string;
  docente_materia_id: number;
};

export default function InformesPendientesPage() {
  const { currentUser } = useAuth();
  const docenteId = currentUser?.docente_id;
  const [informes, setInformes] = useState<InformePendiente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const periodoInforme = EsPeriodoInformeCatedra();
  const { fechas} = useTeacherData();

  useEffect(() => {
    api.get(`/informe-catedra-completado/docente/${docenteId}/pendientes`, {
      params: {
        anio: ANIO_ACTUAL,
        periodo: PERIODO_ACTUAL
      }
    })
      .then((res) => {
        setInformes(res.data);
      })
      .catch((err) => {
        console.error("Error al obtener informes:", err);
        const errorMsg = err.response?.data?.detail || err.message || "Error desconocido al cargar pendientes.";
        setError(errorMsg);
        setInformes([]);
      })
      .finally(() => setLoading(false));
  }, [docenteId]);

  const handleCompletar = (informe: InformePendiente) => {
    navigate(ROUTES.COMPLETAR_INFORME_CATEDRA, {
      state: {
        docenteMateriaId: informe.docente_materia_id,
        materiaNombre: informe.materia_nombre,
        materiaId: informe.materia_id,
        anio: ANIO_ACTUAL,
        periodo: PERIODO_ACTUAL,
        informeBaseId: 3,
      },
    });
  };

  if (loading) {
    return (
      <div className="text-center mt-4">Cargando informes pendientes...</div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center mt-4">
        Error al cargar informes: {error}
      </div>
    );
  }

  if (!periodoInforme) {
    return <PopupPeriodoCerrado msg={"El periodo para completar los informes no está abierto"} fecha_inicio={fechas.inicio} fecha_fin={fechas.fin} />;
  }

  if (!docenteId) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger" role="alert">
          No se pudo obtener la información del docente. Por favor, inicie sesión nuevamente.
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="card shadow">
        <div className="card-header bg-unpsjb-header">
          <h1 className="h4 mb-0">
            Informes Pendientes ({MostrarPeriodo(PERIODO_ACTUAL)} {ANIO_ACTUAL})
          </h1>
        </div>
        <div className="card-body">
          {informes.length === 0 ? (
            <div className="alert alert-info text-center">
              No hay informes pendientes por completar
            </div>
          ) : (
            <div>
              {informes.map((informe, i) => (
                <div key={informe.docente_materia_id} className="col-12 mb-3">
                  <div className="card">
                    <div className="card-body d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-muted me-2">{i + 1}.</span>
                        <span className="fw-bold">
                          {informe.materia_nombre}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCompletar(informe)}
                        className="btn btn-theme-primary rounded-pill px-4"
                      >
                        Completar Informe
                      </button>
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