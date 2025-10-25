import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DOCENTE_ID } from "../../../constants";
import { ANIO_ACTUAL } from "../../../constants";
import { PERIODO_ACTUAL } from "../../../constants";

type InformePendiente = {
  materia_id: number;
  materia_nombre: string;
  docente_materia_id: number;
};

export default function InformesPendientesPage() {
  const docenteId = DOCENTE_ID;
  const [informes, setInformes] = useState<InformePendiente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(
      `http://127.0.0.1:8000/informe-catedra-completado/docente/${docenteId}/pendientes?anio=${ANIO_ACTUAL}&periodo=${PERIODO_ACTUAL}`
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            `Error ${res.status}: No se pudo obtener la lista de pendientes.`
          );
        }
        return res.json();
      })
      .then((data: InformePendiente[]) => {
        setInformes(data);
      })
      .catch((err) => {
        console.error("Error al obtener informes:", err);
        setError(err.message);
        setInformes([]);
      })
      .finally(() => setLoading(false));
  }, [docenteId]);

  const handleCompletar = (informe: InformePendiente) => {
    navigate("/docentes/informe/completar", {
      state: {
        docenteMateriaId: informe.docente_materia_id,
        materiaNombre: informe.materia_nombre,
        materiaId: informe.materia_id,
        anio: ANIO_ACTUAL,
        periodo: PERIODO_ACTUAL,
        informeBaseId: 3, // Asumimos que el informe base siempre es el ID 1
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

  return (
    <div className="container py-4">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h1 className="h4 mb-0">
            Informes Pendientes ({PERIODO_ACTUAL} {ANIO_ACTUAL})
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
                        className="btn btn-primary btn-sm"
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