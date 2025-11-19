import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ANIO_ACTUAL } from "../../../constants";
import ROUTES from "../../../paths";
import Pregunta2B from "./Pregunta2B";
import InformacionGeneral from "./Pregunta0";
import ContenidosAlcanzados from "./Pregunta2A";
import Pregunta2C from "./Pregunta2C";
import Pregunta2 from "./Pregunta2";
import ActividadesDocentes from "./Pregunta3";
import EquipamientoBibliografia from "./Pregunta1";
import type { Pregunta, Respuesta } from "../../../types/types";
import DesempenoAuxiliares from "./Pregunta4";
import ObservacionesComentarios from "./Pregunta5";

export default function CompletarInformeSintetico() {
    const location = useLocation();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [respuestas, setRespuestas] = useState<Respuesta[]>([]);
    const [enviando, setEnviando] = useState(false);
    const [mensaje, setMensaje] = useState<string | null>(null);
    const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
    const [preguntaActivaId, setPreguntaActivaId] = useState<number | null>(null);
    const [maxPasoAlcanzadoIndex, setMaxPasoAlcanzadoIndex] = useState(0);
    const [pasoValido, setPasoValido] = useState(true);

    const {
        dpto = { id: 1, nombre: "dpto informatica" },
        carrera = { id: 1, nombre: "APU" },
        anio = 2025,
        periodo = "PRIMER_CUATRI",
        informeBaseId = 1
    } = location.state || {};

    useEffect(() => {
        if (!dpto || !carrera || !informeBaseId) {
            setError("Faltan datos requeridos.");
            setLoading(false);
            return;
        }

        fetch(`http://127.0.0.1:8000/informes_sinteticos_base/${informeBaseId}/preguntas`)
            .then((res) => {
                if (!res.ok) throw new Error("Error cargando estructura.");
                return res.json();
            })
            .then((data: Pregunta[]) => {
                const ordenadas = data.sort((a, b) => a.orden - b.orden);
                setPreguntas(ordenadas);
                if (ordenadas.length > 0 && preguntaActivaId === null) {
                    setPreguntaActivaId(ordenadas[0].id);
                }
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [informeBaseId]);

    const manejarCambio = useCallback((nuevasRespuestas: Respuesta[] | Respuesta) => {
        const respuestasArray = Array.isArray(nuevasRespuestas)
            ? nuevasRespuestas
            : [nuevasRespuestas];

        setRespuestas((prev) => {
            const actualizadas = prev.filter(
                (r) =>
                    !respuestasArray.some(
                        (n) => n.pregunta_id === r.pregunta_id && n.materia_id === r.materia_id
                    )
            );
            return [...actualizadas, ...respuestasArray];
        });
    }, []);

    const notificarValidacion = useCallback((esValido: boolean) => {
        setPasoValido(esValido);
        if (esValido) setMensaje(null);
    }, []);

    const getIndexActual = () => preguntas.findIndex((p) => p.id === preguntaActivaId);

    const progresoActual = useMemo(() => {
        if (preguntas.length === 0) return 0;
        const pasoActual = maxPasoAlcanzadoIndex + 1;
        return Math.round((pasoActual / preguntas.length) * 100);
    }, [maxPasoAlcanzadoIndex, preguntas.length]);

    const itemsTotales = preguntas.length;
    const itemsCompletados = Math.min(Math.max(maxPasoAlcanzadoIndex + 1, 0), itemsTotales);

    const irAlPaso = (indexDestino: number) => {
        setMensaje(null);
        if (indexDestino < 0 || indexDestino >= preguntas.length) return;

        if (indexDestino > getIndexActual() && !pasoValido) {
            setMensaje("Debe completar todos los campos en rojo antes de avanzar.");
            return;
        }

        setPreguntaActivaId(preguntas[indexDestino].id);

        if (indexDestino > maxPasoAlcanzadoIndex) {
            setMaxPasoAlcanzadoIndex(indexDestino);
        }

        setPasoValido(true);
    };

    const enviarInforme = async () => {
        setEnviando(true);
        setMensaje(null);

        if (!pasoValido) {
            setMensaje("Hay errores en el formulario actual.");
            setEnviando(false);
            return;
        }

        const datosParaBackend = {
            titulo: `Informe ${carrera.nombre} ${anio}`,
            contenido: `De ${dpto.nombre} (${periodo})`,
            anio: ANIO_ACTUAL,
            periodo: periodo,
            informe_base_id: informeBaseId,
            carrera_id: carrera.id,
            respuestas: respuestas
        };

        try {
            const res = await fetch(
                "http://127.0.0.1:8000/informes_sinteticos_completados/completados/",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(datosParaBackend)
                }
            );
            if (!res.ok) throw new Error("Error al enviar.");
            setMensaje("¡Informe enviado con éxito!");
            setTimeout(() => navigate(ROUTES.CARRERAS_DPTO(dpto.id)), 2000);
        } catch (err) {
            setMensaje(`Error: ${(err as Error).message}`);
        } finally {
            setEnviando(false);
        }
    };

    const renderPregunta = (pregunta: Pregunta) => {
        const propsComunes = {
            departamentoId: dpto.id,
            carreraId: carrera.id,
            pregunta,
            anio,
            periodo,
            manejarCambio,
            notificarValidacion
        };
        const propsViejas = {
            id_dpto: dpto.id,
            id_carrera: carrera.id,
            pregunta,
            anio,
            periodo,
            manejarCambio,
            notificarValidacion
        };

        switch (pregunta.cod) {
            case "0":
                return <InformacionGeneral {...propsViejas} />;
            case "1":
                return <EquipamientoBibliografia {...propsComunes} />;
            case "2":
                return <Pregunta2 {...propsComunes} />;
            case "2.A":
                return <ContenidosAlcanzados {...propsViejas} />;
            case "2.B":
                return <Pregunta2B {...propsComunes} />;
            case "2.C":
                return <Pregunta2C {...propsComunes} />;
            case "3":
                return <ActividadesDocentes {...propsViejas} />;
            case "4":
                return <DesempenoAuxiliares {...propsComunes} />;
            case "5":
                return (
                    <ObservacionesComentarios
                        pregunta={pregunta}
                        manejarCambio={manejarCambio}
                    />
                );
            default:
                return <div className="alert alert-secondary">Sin componente.</div>;
        }
    };

    const indexActual = getIndexActual();

    if (loading)
        return (
            <div className="text-center p-5">
                <div className="spinner-border text-primary"></div>
            </div>
        );

    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="bg-light">
            <div className="container-lg py-4">
                <div className="card shadow-sm border-0 rounded-3">
                    <div className="card-header bg-unpsjb-header">
                        <h1 className="h5 m-0 text-white text-center">
                            Informe Sintético: {carrera.nombre}
                        </h1>
                    </div>

                    <div className="card-body p-4">

                        <div className="text-center text-muted small mb-1">
                            Progreso Total: {itemsCompletados} de {itemsTotales} ({progresoActual}%)
                        </div>

                        <div className="d-flex align-items-center mb-4">
                            <div
                                className="progress flex-grow-1"
                                style={{
                                    height: "6px",
                                    borderRadius: "4px",
                                    backgroundColor: "#e5e5e5",
                                    overflow: "hidden"
                                }}
                            >
                                <div
                                    className={`progress-bar ${
                                        !pasoValido ? "bg-danger" : progresoActual === 100 ? "bg-success" : "bg-primary"
                                    }`}
                                    role="progressbar"
                                    style={{
                                        width: `${progresoActual}%`,
                                        transition: "width 0.5s ease"
                                    }}
                                ></div>
                            </div>
                        </div>

                        <ul className="nav nav-pills nav-fill mb-4 border-bottom pb-3">
                            {preguntas.map((p, idx) => (
                                <li key={p.id} className="nav-item">
                                    <a
                                        className={`nav-link ${
                                            preguntaActivaId === p.id
                                                ? "active"
                                                : idx <= maxPasoAlcanzadoIndex
                                                ? "text-muted"
                                                : "disabled"
                                        }`}
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            irAlPaso(idx);
                                        }}
                                        style={{
                                            cursor:
                                                idx <= maxPasoAlcanzadoIndex
                                                    ? "pointer"
                                                    : "not-allowed"
                                        }}
                                    >
                                        {p.cod}
                                    </a>
                                </li>
                            ))}
                        </ul>

                        <div className="step-content-container p-2" style={{ minHeight: "350px" }}>
                            {preguntas.map((p) => (
                                <div
                                    key={p.id}
                                    style={{
                                        display: preguntaActivaId === p.id ? "block" : "none"
                                    }}
                                >
                                    {renderPregunta(p)}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card-footer bg-white p-4 d-flex justify-content-between">
                        <button
                            onClick={() => irAlPaso(indexActual - 1)}
                            className="btn btn-theme-primary rounded-pill px-4"
                            disabled={indexActual === 0}
                        >
                            Anterior
                        </button>

                        {indexActual < preguntas.length - 1 ? (
                            <button
                                onClick={() => irAlPaso(indexActual + 1)}
                                className="btn btn-theme-primary rounded-pill px-4"
                            >
                                Siguiente
                            </button>
                        ) : (
                            <button
                                onClick={enviarInforme}
                                className="btn btn-success rounded-pill px-4 shadow"
                                disabled={enviando}
                            >
                                {enviando ? "Enviando..." : "Enviar Informe"}
                            </button>
                        )}
                    </div>

                    {mensaje && (
                        <div
                            className={`alert mt-3 mx-4 ${
                                mensaje.includes("éxito") ? "alert-success" : "alert-danger"
                            }`}
                        >
                            {mensaje}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
