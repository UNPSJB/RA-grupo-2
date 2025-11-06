import { useEffect, useState } from "react";

interface MateriaInfo {
  codigo: string;
  nombre: string;
  cantidad_alumnos: number;
  cantidad_comisiones_teoricas: number;
  cantidad_comisiones_practicas: number;
}

interface InformacionGeneralProps {
  departamentoId: number;
  onChangeMaterias?: (materias: MateriaInfo[]) => void; 
}

export default function InformacionGeneral({
  departamentoId,
  onChangeMaterias,
}: InformacionGeneralProps) {
  const [materias, setMaterias] = useState<MateriaInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!departamentoId) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch(
          `http://127.0.0.1:8000/informe-catedra-completado/departamento/${departamentoId}/informacion-general`
        );

        if (!res.ok) {
          throw new Error(`Error HTTP ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
          throw new Error("El formato de los datos recibidos no es válido.");
        }

        setMaterias(data);
        onChangeMaterias?.(data);
      } catch (err) {
        console.error("Error al obtener información:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error desconocido");
        }
      } finally {
        setIsLoading(false);
      }
    };  

    fetchData();
  }, [departamentoId, onChangeMaterias]);

  // Actualizo el estado local y notifica al padre
  const handleChange = <K extends keyof MateriaInfo>(
    index: number,
    field: K,
    value: MateriaInfo[K]
  ) => {
    const updated = [...materias];
    updated[index][field] = value;
    setMaterias(updated);
    onChangeMaterias?.(updated); 
  };

  return (
    <div className="container mt-4">
      <h4 className="mb-3">Información General</h4>

      {isLoading ? (
        <div className="text-center text-secondary">Cargando datos...</div>
      ) : error ? (
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
        </div>
      ) : materias.length === 0 ? (
        <div className="alert alert-warning">
          No hay información disponible para este departamento.
        </div>
      ) : (
        <>
          <div className="accordion" id="accordionMaterias">
            {materias.map((materia, index) => (
              <div className="accordion-item" key={index}>
                <h2 className="accordion-header" id={`heading${index}`}>
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse${index}`}
                    aria-expanded="false"
                    aria-controls={`collapse${index}`}
                  >
                    {materia.nombre}
                  </button>
                </h2>
                <div
                  id={`collapse${index}`}
                  className="accordion-collapse collapse"
                  aria-labelledby={`heading${index}`}
                  data-bs-parent="#accordionMaterias"
                >
                  <div className="accordion-body">
                    <div className="row g-3">
                      <CampoTexto label="Código" value={materia.codigo} readOnly />
                      <CampoTexto label="Nombre" value={materia.nombre} readOnly />
                      <CampoTextoNumero
                        label="Cantidad de alumnos"
                        value={materia.cantidad_alumnos}
                        onChange={(v) =>
                          handleChange(index, "cantidad_alumnos", v)
                        }
                      />

                      <CampoTextoNumero
                        label="Comisiones Teóricas"
                        value={materia.cantidad_comisiones_teoricas}
                        onChange={(v) =>
                          handleChange(index, "cantidad_comisiones_teoricas", v)
                        }
                      />

                      <CampoTextoNumero
                        label="Comisiones Prácticas"
                        value={materia.cantidad_comisiones_practicas}
                        onChange={(v) =>
                          handleChange(index, "cantidad_comisiones_practicas", v)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 🔍 Muestra el JSON actual (solo para depuración) */}
          <pre className="bg-light p-3 rounded border mt-4">
            {JSON.stringify(materias, null, 2)}
          </pre>
        </>
      )}
    </div>
  );
}

function CampoTexto({
  label,
  value,
  readOnly = false,
  onChange,
}: {
  label: string;
  value: string;
  readOnly?: boolean;
  onChange?: (v: string) => void;
}) {
  return (
    <div className="col-md-6">
      <label className="form-label">{label}</label>
      <input
        type="text"
        className="form-control"
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
}

function CampoTextoNumero({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="col-md-4">
      <label className="form-label">{label}</label>
      <input
        type="number"
        className="form-control"
        min={0}
        max={100}
        value={value}
        onChange={(e) => {
          const num = Number(e.target.value);
          if (num >= 0 && num <= 100) onChange(num);
        }}
      />
    </div>
  );
}
