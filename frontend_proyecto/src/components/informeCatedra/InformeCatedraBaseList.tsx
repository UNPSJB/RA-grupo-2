import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function InformeCatedraBaseList() {
  const [informes, setInformes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/informes_catedra")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("Datos recibidos:", data); 
        if (Array.isArray(data)) {
          setInformes(data);
        } else if (data.informes && Array.isArray(data.informes)) {
          setInformes(data.informes);
        } else {
          console.error("Formato inesperado:", data);
          setInformes([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching informes:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando informes...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Informes de Cátedra Base</h1>
      <Link to="/informes-catedra-base/nuevo" style={{ 
        display: "inline-block", 
        marginBottom: "1rem",
        padding: "8px 16px",
        backgroundColor: "#007bff",
        color: "white",
        textDecoration: "none",
        borderRadius: "4px"
      }}>
        + Nuevo Informe
      </Link>
      
      {informes.length === 0 ? (
        <p>No hay informes disponibles.</p>
      ) : (
        <ul>
          {informes.map((inf) => (
            <li key={inf.id} style={{ marginTop: "8px" }}>
              <strong>{inf.titulo}</strong> —{" "}
              <Link to={`/informes-catedra-base/${inf.id}`}>Ver detalle</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}