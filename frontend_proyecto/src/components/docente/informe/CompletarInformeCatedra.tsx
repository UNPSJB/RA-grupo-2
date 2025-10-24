import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ANIO_ACTUAL } from "../../../constants";

interface Pregunta {
  id: number;
  enunciado: string;
}

interface CategoriaConPreguntas {
  id: number;
  texto: string;
  preguntas: Pregunta[];
}

export default function CompletarInformeCatedra() {
  const location = useLocation();
  const navigate = useNavigate();

  const [categoriasConPreguntas, setCategoriasConPreguntas] = useState<
    CategoriaConPreguntas[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const {
    docenteMateriaId,
    materiaNombre,
    anio,
    periodo,
    informeBaseId = 1,
  } = location.state || {};

  useEffect(() => {
    if (!informeBaseId) {
      setError("ID de informe base no encontrado.");
      setLoading(false);
      return;
    }

    fetch(
      `http://127.0.0.1:8000/informes_catedra/${informeBaseId}/categorias_con_preguntas`
    )
      .then((res) => {
        if (!res.ok)
          throw new Error("No se pudo cargar la estructura del informe.");
        return res.json();
      })
      .then((data: CategoriaConPreguntas[]) => {
        setCategoriasConPreguntas(data);
        const respuestasIniciales: Record<number, string> = {};
        data.forEach((cat) => {
          cat.preguntas.forEach((p) => {
            respuestasIniciales[p.id] = "";
          });
        });
        setRespuestas(respuestasIniciales);
      })
      .catch((err) => {
        console.error("Error fetching estructura informe:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [informeBaseId]);

  const manejarCambio = (preguntaId: number, valor: string) => {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: valor }));
    if (mensaje && mensaje.includes("complete")) setMensaje(null);
  };

  const validarFormulario = (): boolean => {
    const totalPreguntas = categoriasConPreguntas.reduce(
      (acc, cat) => acc + cat.preguntas.length,
      0
    );
    const respondidas = Object.values(respuestas).filter(
      (r) => r && r.trim() !== ""
    ).length;
    return respondidas === totalPreguntas;
  };
  
  const limpiarEnunciado = (texto: string) => {
    const parts = texto.split('. ');
    if (parts.length < 2) return texto;
    const prefijo = parts[0];
    if (!isNaN(parseInt(prefijo))) {
      return parts.slice(1).join('. ');
    }
    return texto;
  };

  const enviarInforme = async () => {
    if (!validarFormulario()) {
      setMensaje("Por favor, complete todas las preguntas requeridas.");
      return;
    }
    setEnviando(true);
    setMensaje(null);
    const respuestasFormateadas = Object.entries(respuestas).map(
      ([preguntaIdStr, texto]) => ({
        pregunta_id: parseInt(preguntaIdStr, 10),
        opcion_id: null,
        texto_respuesta: texto,
      })
    );
    const datosParaBackend = {
      docente_materia_id: docenteMateriaId,
      informe_catedra_base_id: informeBaseId,
      titulo: `Informe ${materiaNombre} ${anio}`,
      contenido: `Informe para ${materiaNombre} (${periodo} ${anio})`,
      anio: ANIO_ACTUAL,
      periodo: periodo,
      respuestas: respuestasFormateadas,
    };
    try {
      const res = await fetch(
        "http://127.0.0.1:8000/informe-catedra-completado/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datosParaBackend),
        }
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({
          detail: "Error desconocido al enviar.",
        }));
        throw new Error(errorData.detail || "Error al enviar el informe");
      }
      setMensaje("¡Informe enviado con éxito!");
      setTimeout(() => {
        navigate("/docentes/informes-pendientes");
      }, 2000);
    } catch (err: any) {
      console.error("Error enviando informe:", err);
      setMensaje(`Error: ${err.message}`);
    } finally {
      setEnviando(false);
    }
  };

  if (!docenteMateriaId || !materiaNombre) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger text-center">
          Error: Faltan datos para cargar el informe. Intenta volver a la lista.
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center mt-4">Cargando formulario...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center mt-4">Error: {error}</div>
    );
  }

  return (
    <div className="container py-4">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h1 className="h4 mb-0">Completar Informe - {materiaNombre}</h1>
        </div>
        <div className="card-body">
          <div className="alert alert-info mb-4">
            <strong>Año:</strong> {anio} | <strong>Periodo:</strong> {periodo}
          </div>

          {categoriasConPreguntas.map((categoria) => (
            <div key={categoria.id} className="col-12 mb-3">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <h2 className="h5 mb-3 fw-bold">{categoria.texto}</h2>
                  {categoria.preguntas.map((pregunta, i) => (
                    <div key={pregunta.id} className="mb-4">
                      <div className="mb-2">
                        <span className="text-muted me-2">{i + 1}.</span>
                        <span>
                          {limpiarEnunciado(pregunta.enunciado)}{" "}
                          <span className="text-danger">*</span>
                        </span>
                      </div>
                      <div>
                        <textarea
                          id={`pregunta-${pregunta.id}`}
                          className="form-control"
                          rows={3}
                          value={respuestas[pregunta.id] || ""}
                          onChange={(e) =>
                            manejarCambio(pregunta.id, e.target.value)
                          }
                          placeholder="Escriba su respuesta aquí..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div className="text-center mt-4">
            <button
              onClick={enviarInforme}
              className="btn btn-success btn-lg"
              disabled={enviando || !validarFormulario()}
            >
              {enviando ? "Enviando..." : "Enviar Informe"}
            </button>

            {mensaje && (
              <div
                className={`mt-3 alert ${
                  mensaje.includes("éxito")
                    ? "alert-success"
                    : "alert-danger"
                }`}
              >
                {mensaje}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}