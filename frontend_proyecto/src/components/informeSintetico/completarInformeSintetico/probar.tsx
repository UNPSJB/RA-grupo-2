import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ANIO_ACTUAL } from "../../../constants";
import ROUTES from "../../../paths";
import Pregunta2B from "./Pregunta2B";
import InformacionGeneral from "./informacionGeneral";
import ContenidosAlcanzados from "./contenidosAlcanzados";
interface Pregunta {
    id: number;
    orden: number;
    enunciado: string;
}

interface Respuesta {
    pregunta_id: number;
    texto_respuesta: string;
    materia_id: number;
}

export default function CompletarInformeSintetico() {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [respuestas, setRespuestas] = useState<Respuesta[]>([]);
    const [enviando, setEnviando] = useState(false);
    const [mensaje, setMensaje] = useState<string | null>(null);
    const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
    const [preguntaActiva, setPreguntaActiva] = useState<number | null>(null);

    const {
        dpto = { id: 1, nombre: "dpto informatica" },
        carrera = { id: 1, nombre: "APU" },
        anio = 2025,
        periodo = "PRIMER_CUATRI",
        informeBaseId = 1,
    } = location.state || {};

    useEffect(() => {
        if (!informeBaseId) {
            setError("ID de informe base no encontrado.");
            setLoading(false);
            return;
        }
        fetch(
            `http://127.0.0.1:8000/informes_sinteticos_base/${informeBaseId}/preguntas`
        )
            .then((res) => {
                if (!res.ok)
                    throw new Error("No se pudo cargar la estructura del informe.");
                return res.json();
            })
            .then((data: Pregunta[]) => {
                const ordenadas = data.sort((a, b) => a.orden - b.orden);
                setPreguntas(ordenadas);
            })
            .catch((err) => {
                console.error("Error fetching preguntas del informe:", err);
                setError(err.message);
            })
            .finally(() => setLoading(false));
    }, [informeBaseId]);

    /*
      const manejarCambio = (resp: Respuesta) => {
          setRespuestas((prev) => ({ ...prev, resp }));
          if (mensaje && mensaje.includes("complete")) setMensaje(null);
      };
      */

    const manejarCambio = (nuevasRespuestas: Respuesta[] | Respuesta) => {
        const respuestasArray = Array.isArray(nuevasRespuestas)
            ? nuevasRespuestas
            : [nuevasRespuestas];

        setRespuestas((prev) => {
            const actualizadas = prev.filter(
                (r) =>
                    !respuestasArray.some(
                        (n) =>
                            n.pregunta_id === r.pregunta_id && n.materia_id === r.materia_id
                    )
            );
            return [...actualizadas, ...respuestasArray];
        });

        if (mensaje && mensaje.includes("complete")) setMensaje(null);
    };

    const enviarInforme = async () => {
        setEnviando(true);
        setMensaje(null);

        const datosParaBackend = {
            titulo: `Informe ${carrera.nombre} ${anio}`,
            contenido: `De ${dpto.nombre} (${periodo})`,
            anio: ANIO_ACTUAL,
            periodo: periodo,
            informe_base_id: informeBaseId,
            respuestas: respuestas,
        };

        try {
            const res = await fetch(
                "http://127.0.0.1:8000/informes_sinteticos_completados/completados/",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(datosParaBackend),
                }
            );
            if (!res.ok) {
                const errorData = await res
                    .json()
                    .catch(() => ({ detail: "Error desconocido al enviar." }));
                throw new Error(errorData.detail || "Error al enviar el informe");
            }
            setMensaje("¡Informe enviado con éxito!");
            setTimeout(() => {
                navigate(ROUTES.CARRERAS_DPTO);
            }, 2000);
        } catch (err: Error | unknown) {
            console.error("Error enviando informe:", err);
            setMensaje(`Error: ${(err as Error).message}`);
        } finally {
            setEnviando(false);
        }
    };

    if (!dpto?.nombre || !carrera?.nombre) {
        return (
            <div className="alert alert-danger">
                Error: No se encontró la información necesaria.
            </div>
        );
    }
    if (loading) {
        return (
            <div className="d-flex justify-content-center">
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }
    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    const renderPregunta = (pregunta: Pregunta) => {
        if (/Pregunta 2.?b/i.test(pregunta.enunciado)) {
            return (
                <Pregunta2B
                    departamentoId={dpto.id}
                    carreraId={carrera.id}
                    pregunta={pregunta}
                    anio={anio}
                    periodo={periodo}
                    manejarCambio={manejarCambio}
                />
            );
        }
        if (/Pregunta 1/i.test(pregunta.enunciado)) {
            return (
                <InformacionGeneral
                    id_dpto={dpto.id}
                    id_carrera={carrera.id}
                    pregunta={pregunta}
                    anio={anio}
                    periodo={periodo}
                    manejarCambio={manejarCambio}
                />
            );
        }
        if (/Pregunta 2.?a/i.test(pregunta.enunciado)) {
            return (
                <ContenidosAlcanzados
                    id_dpto={dpto.id}
                    id_carrera={carrera.id}
                    pregunta={pregunta} 
                    anio={anio}
                    periodo={periodo}
                    manejarCambio={manejarCambio}
                />
            );
        }
        return (
            <div className="alert alert-secondary">
                Pregunta "{pregunta.enunciado}" sin componente asignado.
            </div>
        );
    };

    return (
        <div className="bg-light">
            <div className="container-lg py-4">
                <div className="card shadow-sm border-0 rounded-3">
                    <div className="card-header bg-primary text-white">
                        <h1 className="h4 mb-0 text-center">
                            Informe Sintético – {carrera.nombre}
                        </h1>
                    </div>

                    <div className="card-body p-4 p-md-5">
                        <ul className="nav nav-pills nav-fill mb-4">
                            {preguntas.map((p) => (
                                <li key={p.id} className="nav-item">
                                    <a
                                        className={`nav-link ${preguntaActiva === p.id ? "active" : "text-muted"
                                            }`}
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setPreguntaActiva(p.id);
                                        }}
                                        style={{ cursor: "pointer", fontWeight: 500 }}
                                    >
                                        {p.enunciado}
                                    </a>
                                </li>
                            ))}
                        </ul>

                        <div
                            className="step-content-container"
                            style={{
                                height: "500px",
                                overflowY: "auto",
                                paddingRight: "15px",
                            }}
                        >
                            {preguntas.map((p) => (
                                <div
                                    key={p.id}
                                    style={{ display: preguntaActiva === p.id ? "block" : "none" }}
                                >
                                    {renderPregunta(p)}
                                </div>
                            ))}
                        </div>

                    </div>

                    <div className="card-footer bg-white border-0 rounded-bottom-3 p-4">
                        <div className="d-flex justify-content-between">
                            <button
                                onClick={enviarInforme}
                                className="btn btn-success rounded-pill px-4 shadow-sm ms-auto"
                                disabled={enviando}
                            >
                                {enviando ? "Enviando..." : "Enviar Informe"}
                            </button>
                        </div>

                        {mensaje && (
                            <div
                                className={`mt-4 alert ${mensaje.includes("éxito") ? "alert-success" : "alert-danger"
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
