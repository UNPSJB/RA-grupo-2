import { useState } from "react";
import {useNavigate } from "react-router-dom";
import ROUTES from "../../../paths";

export default function PopupPeriodoCerrado({ msg, fecha_inicio, fecha_fin }: { msg: string, fecha_inicio: Date|null, fecha_fin: Date|null }) {
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();

  if (!visible) return null;

  const hoy = new Date();
  let mensajeFinal;

  const formatDate = (d: Date) => d.toLocaleDateString("es-AR");

  if (fecha_inicio && fecha_fin) {
    if (hoy > fecha_fin) {
      mensajeFinal = `Finalizó el ${formatDate(fecha_fin)}`;
    }
    if (hoy < fecha_inicio) {
      mensajeFinal = `Comenzará el ${formatDate(fecha_inicio)}`;
    }
  }

  return (
    <div className="popup-overlay">
      <div className="popup-card">
        <button className="popup-close" 
        onClick={() => {
          setVisible(false);
          navigate(ROUTES.HOME);
        }}
        >
          ×
        </button>

        <h5 className="mb-0 text-muted">
          {msg}
        </h5>
        {mensajeFinal && (
          <h6 className="text-muted mt-2">{mensajeFinal}</h6>
        )}
      </div>
    </div>
  );
}
