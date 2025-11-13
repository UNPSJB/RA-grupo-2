import { useEffect, useState } from "react";

interface Materia {
  id: number;
  nombre: string;
  matricula: string;
  departamento_id: number; 
}

interface Encuesta {
  id: number;
  nombre: string;
}

interface InformeCatedra {
  id: number;
  titulo: string; 
}

interface Departamento {
  id: number;
  nombre: string;
}

interface AsignarFormularios {
  materia_ids: number[];
  encuesta_id: number | null;
  informe_catedra_id: number | null;
}

const API_URL = "http://127.0.0.1:8000";

export default function AsignarFormularios() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [encuestas, setEncuestas] = useState<Encuesta[]>([]);
  const [informes, setInformes] = useState<InformeCatedra[]>([]);
  
  const [departamentoMap, setDepartamentoMap] = useState(new Map<number, string>());

  const [selectedMaterias, setSelectedMaterias] = useState(new Set<number>());
  const [selectedEncuesta, setSelectedEncuesta] = useState("");
  const [selectedInforme, setSelectedInforme] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [materiasRes, encuestasRes, informesRes, departamentosRes] =
          await Promise.all([
            fetch(`${API_URL}/materias/`),
            fetch(`${API_URL}/encuestas/`),
            fetch(`${API_URL}/informes_catedra/`),
            fetch(`${API_URL}/departamentos/`),
          ]);

        if (!materiasRes.ok) throw new Error("Error al cargar materias");
        if (!encuestasRes.ok) throw new Error("Error al cargar encuestas");
        if (!informesRes.ok) throw new Error("Error al cargar informes");
        if (!departamentosRes.ok) throw new Error("Error al cargar departamentos"); 

        const [materiasData, encuestasData, informesData, departamentosData] =
          await Promise.all([
            materiasRes.json(),
            encuestasRes.json(),
            informesRes.json(),
            departamentosRes.json(), 
          ]);

        setMaterias(materiasData);
        setEncuestas(encuestasData);
        setInformes(informesData);

        const newMap = new Map<number, string>();
        departamentosData.forEach((depto: Departamento) => {
          newMap.set(depto.id, depto.nombre);
        });
        setDepartamentoMap(newMap);
        
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error desconocido al cargar datos"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSelectMateria = (materiaId: number) => {
    const newSelection = new Set(selectedMaterias);
    if (newSelection.has(materiaId)) {
      newSelection.delete(materiaId);
    } else {
      newSelection.add(materiaId);
    }
    setSelectedMaterias(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedMaterias.size === materias.length) {
      setSelectedMaterias(new Set());
    } else {
      const allMateriaIds = new Set(materias.map((m) => m.id));
      setSelectedMaterias(allMateriaIds);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);

    if (selectedMaterias.size === 0) {
      setSubmitError("Debes seleccionar al menos una materia.");
      return;
    }
    if (!selectedEncuesta && !selectedInforme) {
      setSubmitError(
        "Debes seleccionar al menos una Encuesta o un Informe para asignar."
      );
      return;
    }

    const payload: AsignarFormularios = {
      materia_ids: Array.from(selectedMaterias),
      encuesta_id: selectedEncuesta ? parseInt(selectedEncuesta) : null,
      informe_catedra_id: selectedInforme ? parseInt(selectedInforme) : null,
    };

    try {
      const response = await fetch(`${API_URL}/materias/asignar-formularios/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Error al guardar los cambios");
      }

      setSuccessMessage(data.message || "Asignación exitosa");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Error desconocido al guardar"
      );
    }
  };

  if (loading) return <p>Cargando gestión de formularios...</p>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-header bg-unpsjb-header text-white">
          <h4 className="mb-0">Asignar Formularios a Materias</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* --- 1. Selectores de Formularios --- */}
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label htmlFor="selectEncuesta" className="form-label">
                  <strong>1. Seleccionar Encuesta Base</strong>
                </label>
                <select
                  id="selectEncuesta"
                  className="form-select"
                  value={selectedEncuesta}
                  onChange={(e) => setSelectedEncuesta(e.target.value)}
                >
                  <option value="">(Opcional) Ninguna</option>
                  {encuestas.map((enc) => (
                    <option key={enc.id} value={enc.id}>
                      {enc.nombre} - ID: {enc.id}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label htmlFor="selectInforme" className="form-label">
                  <strong>2. Seleccionar Informe Cátedra Base</strong>
                </label>
                <select
                  id="selectInforme"
                  className="form-select"
                  value={selectedInforme}
                  onChange={(e) => setSelectedInforme(e.target.value)}
                >
                  <option value="">(Opcional) Ninguno</option>
                  {informes.map((inf) => (
                    <option key={inf.id} value={inf.id}>
                      {inf.titulo} - ID:{inf.id}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <hr />

            {/* --- 2. Tabla de Materias --- */}
            <h5 className="mb-3">
              <strong>3. Seleccionar Materias</strong> (
              {selectedMaterias.size} seleccionadas)
            </h5>
            <div
              className="table-responsive"
              style={{ maxHeight: "400px", overflowY: "auto" }}
            >
              <table className="table table-hover table-sm">
                <thead className="table-light" style={{ position: "sticky", top: 0 }}>
                  <tr>
                    <th style={{ width: "5%" }}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        title="Seleccionar todas"
                        checked={selectedMaterias.size === materias.length && materias.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th style={{ width: "10%" }}>Matrícula</th>
                    <th>Nombre de Materia</th>
                    <th  style={{ width: "67%" }}>Departamento</th> 
                  </tr>
                </thead>
                <tbody>
                  {materias.map((materia) => (
                    <tr
                      key={materia.id}
                      onClick={() => handleSelectMateria(materia.id)}
                      style={{ cursor: "pointer" }}
                      className={selectedMaterias.has(materia.id) ? "table-primary" : ""}
                    >
                      <td>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={selectedMaterias.has(materia.id)}
                          onChange={() => {}} 
                        />
                      </td>
                      <td>{materia.matricula}</td>
                      <td>{materia.nombre}</td>
                      <td>{departamentoMap.get(materia.departamento_id) || "..."}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* --- 3. Botón de Envío y Alertas --- */}
            <hr />
            {submitError && (
              <div className="alert alert-danger">{submitError}</div>
            )}
            {successMessage && (
              <div className="alert alert-success">{successMessage}</div>
            )}
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={selectedMaterias.size === 0 || (!selectedEncuesta && !selectedInforme)}
            >
              Asignar Formularios a {selectedMaterias.size} Materias
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}