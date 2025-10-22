import { useState, useEffect } from "react";

export default function CrearInformeCatedra() {
  const [materias, setMaterias] = useState<any[]>([]);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState("");
  const [contenido, setContenido] = useState("");
  const docente_Id = 1

  //traigo materias del profesor
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/docentes/${docente_Id}/materias`)
      .then(res => res.json())
      .then(data => {
        if (data.materias) setMaterias(data.materias);
      })
      .catch(err => console.error("Error cargando materias:", err));
  }, []);

  // enviar informe
const PruebaGuardar = async () => {
  if (!materiaSeleccionada || !contenido.trim()) {
    alert("Debe seleccionar una materia y escribir el informe.");
    return;
  }

  const materiaSeleccionadaObj = materias.find(
    (m) => m.id === Number(materiaSeleccionada)
  );

  const res = await fetch("http://127.0.0.1:8000/informes_catedra/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      titulo: "Informe de Cátedra",
      contenido,
      anio: 2025,
      periodo: materiaSeleccionadaObj.periodo,
      docente_materia_id: materiaSeleccionadaObj.relacion_id, 
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("Error al crear informe:", data);
    alert("Error al crear informe: " + (data.detail || JSON.stringify(data)));
  } else {
    alert("Informe guardado correctamente.");
  }
};

  return (
    <div className="container py-4">
      <h2>Crear Informe de Cátedra</h2>
      <div className="mb-3">
        <label className="form-label">Seleccione una materia:</label>
        <select
          className="form-select"
          value={materiaSeleccionada}
          onChange={(e) => setMateriaSeleccionada(e.target.value)}
        >
          <option value="">-- Seleccionar --</option>
          {materias.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Contenido del informe:</label>
        <textarea
          className="form-control"
          rows={5}
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
        />
      </div>

      <button className="btn btn-primary" onClick={PruebaGuardar}>
        Guardar Informe
      </button>
    </div>
  );
}
