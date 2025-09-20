import { useEffect, useState } from "react";
import "./departamentos.css";
import ListaCarreras from "../carrera/ListarCarreras";
import type { Departamento, Carrera } from "../../types/types";

function DetalleDepartamento() {
  const [departamento, setDepartamento] = useState<Departamento | null>(null);
  const [carreras, setCarreras] = useState<Carrera[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/departamentos/1")
      .then((res) => res.json())
      .then((data) => setDepartamento(data))
      .catch((err) => console.error("Error cargando departamento:", err));

    fetch("http://127.0.0.1:8000/carreras/departamento/1")
      .then((res) => res.json())
      .then((data) => setCarreras(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error cargando carreras:", err))

  }, []);


  if (!departamento) {
    return null;
  }

  return (
    <div className="departamento-container">
      <div className="departamento-header">
        <h1>Departamento de {departamento.nombre}</h1>
        <h2>Carreras:</h2>
      </div>
      <ListaCarreras carreras={carreras} />
    </div>
  );
}

export default DetalleDepartamento;