import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ANIO_ACTUAL, PERIODO_ACTUAL } from "../../constants";
import MensajeExito from "../pregunta/preguntaCerrada/MensajeExito";
import ROUTES from "../../paths";

type EncuestaDisponible = {
  materia: string;
  encuesta: string;
  materia_id: number;
  encuesta_id: number;
};

type Props = {
  encuestas: EncuestaDisponible[];
  alumnoId: number;
};

export default function EncuestasDisponibles({ encuestas, alumnoId }: Props) {
  const navigate = useNavigate();
  const [mensajeExito, setMensajeExito] = useState<string | null>(null); 

  const verificarYCompletar = async (e: EncuestaDisponible) => {
    try {
      const params = new URLSearchParams({
        alumno_id: alumnoId.toString(),
        encuesta_id: e.encuesta_id.toString(),
        materia_id: e.materia_id.toString(),
        anio: ANIO_ACTUAL.toString(),
        periodo: PERIODO_ACTUAL
      });

      const response = await fetch(`http://localhost:8000/encuesta-completada/existe?${params}`);
      const data = await response.json();

      if(data.existe){
        setMensajeExito(`Ya completaste la encuesta de ${e.materia}`); 
      } else{
        navigate(ROUTES.COMPLETAR_ENCUESTA, {
          state: {
            alumnoId: alumnoId,
            encuestaId: e.encuesta_id,
            materiaId: e.materia_id,
            nombreMateria: e.materia
          }
        });
      }
    } catch (error) {
      console.error("Error al verificar encuesta:", error);
      setMensajeExito("Error al verificar la encuesta");  
    }
  };

  
  const cerrarMensaje = () => {
    setMensajeExito(null);
  };

  
  if (mensajeExito) {
    return (
      <MensajeExito
        mensaje={mensajeExito}
        onClose={cerrarMensaje}
      />
    );
  } 

  if (encuestas.length === 0) {
    return (
      <div className="alert alert-info text-center">
        No hay encuestas pendientes
      </div>
    );
  }

  return (
    <div className="list-group">
      {encuestas.map((e, i) => (
        <div key={i} className="col-12 mb-3">
          <div className="card">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted me-2">{i + 1}.</span>
                <span className="fw-bold">
                  <span>{e.materia}</span> 
                </span>
                <span className="text"> — {e.encuesta}{" "} </span>
              </div>
              <button onClick={() => verificarYCompletar(e)}
                className="btn btn-theme-primary rounded-pill px-6"
              >
                Completar Encuesta
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}