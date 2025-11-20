import { useState } from "react";
import {useNavigate } from "react-router-dom";
import ROUTES from "../../../paths";

export default function PopupPeriodoCerrado({ msg }: { msg: string }) {
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();

  if (!visible) return null;

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
      </div>
    </div>
  );
}
