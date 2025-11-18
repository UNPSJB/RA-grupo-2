import { useEffect, useState } from "react";
import { ANIO_ACTUAL, PERIODO_ACTUAL } from "../../../constants";

interface PeriodoApertura {
    anio: number;
    periodo: string;
    inicio_encuesta: Date
    fin_encuesta: Date
    inicio_informe_catedra: Date
    fin_informe_catedra: Date
    inicio_informe_sintetico: Date
    fin_informe_sintetico: Date
}

export default function DefinirFechas() {
    const [periodoApertura, setPeriodoApertura] = useState<PeriodoApertura>()
    const [estaDefinido, setEstaDefinido] = useState<boolean>(true)
    const [form, setForm] = useState({
        inicio_encuesta: "",
        fin_encuesta: "",
        inicio_informe_catedra: "",
        fin_informe_catedra: "",
        inicio_informe_sintetico: "",
        fin_informe_sintetico: "",
    });
    const [error, setError] = useState<string>("");

    useEffect(() => {
        fetch(`http://127.0.0.1:8000/periodos_apertura/?anio=${ANIO_ACTUAL}&periodo=${PERIODO_ACTUAL}`)
            .then(res => {
                if (res.status == 404) {
                    setEstaDefinido(false)
                    return null;
                }
                if (!res.ok) throw new Error("Error al obtener el periodo de fechas");
                return res.json();
            })
            .then(data => {
                if (data) setPeriodoApertura(data)
            })
            .catch(console.error);
    })

    const validarOrden = () => {
        const fechas = [
            form.inicio_encuesta,
            form.fin_encuesta,
            form.inicio_informe_catedra,
            form.fin_informe_catedra,
            form.inicio_informe_sintetico,
            form.fin_informe_sintetico,
        ];

        for (let i = 0; i < fechas.length - 1; i++) {
            if (fechas[i] && fechas[i + 1]) {
                if (new Date(fechas[i]) >= new Date(fechas[i + 1])) {
                    return false;
                }
            }
        }
        return true;
    };

    const handleGuardar = () => {
        setError("");

        const todasCompletas = Object.values(form).every(f => f !== "");
        if (!todasCompletas) {
            setError("Debes completar todas las fechas antes de guardar.");
            return;
        }


        if (!validarOrden()) {
            setError("Cada fecha debe ser posterior a la anterior.");
            return;
        }

        const body = {
            ...form,
            anio: ANIO_ACTUAL,
            periodo: PERIODO_ACTUAL,
        };

        fetch("http://127.0.0.1:8000/periodos_apertura/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        })
            .then(res => {
                if (!res.ok) throw new Error("Error al guardar");
                alert("Fechas definidas correctamente.");
                window.location.reload();
            })
            .catch(err => setError(err.message));
    };

    if (estaDefinido) {
        return (
            <div className="container mt-4">
                <div className="card shadow-sm">
                    <div className="card-header bg-unpsjb-header text-white">
                        <h4 className="mb-0">Periodos para completar encuestas e informes</h4>
                    </div>

                    <div className="card-body">
                        <div className="row text-center fs-5">

                            <div className="col">
                                <h5 className="fw-bold mb-3">Encuestas</h5>
                                <p>
                                    <span className="fw-bold">Inicio:</span><br />
                                    {periodoApertura?.inicio_encuesta
                                        ? new Date(periodoApertura.inicio_encuesta).toLocaleDateString()
                                        : "—"}
                                </p>
                                <p>
                                    <span className="fw-bold">Fin:</span><br />
                                    {periodoApertura?.fin_encuesta
                                        ? new Date(periodoApertura.fin_encuesta).toLocaleDateString()
                                        : "—"}
                                </p>
                            </div>

                            <div className="col">
                                <h5 className="fw-bold mb-3">Informe de Cátedra</h5>
                                <p>
                                    <span className="fw-bold">Inicio:</span><br />
                                    {periodoApertura?.inicio_informe_catedra
                                        ? new Date(periodoApertura.inicio_informe_catedra).toLocaleDateString()
                                        : "—"}
                                </p>
                                <p>
                                    <span className="fw-bold">Fin:</span><br />
                                    {periodoApertura?.fin_informe_catedra
                                        ? new Date(periodoApertura.fin_informe_catedra).toLocaleDateString()
                                        : "—"}
                                </p>
                            </div>

                            <div className="col">
                                <h5 className="fw-bold mb-3">Informe Sintético</h5>
                                <p>
                                    <span className="fw-bold">Inicio:</span><br />
                                    {periodoApertura?.inicio_informe_sintetico
                                        ? new Date(periodoApertura.inicio_informe_sintetico).toLocaleDateString()
                                        : "—"}
                                </p>
                                <p>
                                    <span className="fw-bold">Fin:</span><br />
                                    {periodoApertura?.fin_informe_sintetico
                                        ? new Date(periodoApertura.fin_informe_sintetico).toLocaleDateString()
                                        : "—"}
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
            </div>


        );
    }

    else {
        return (
            <div className="container mt-4">
                <div className="card shadow-sm">
                    <div className="card-header bg-unpsjb-header text-white">
                        <h4 className="mb-0">Definir periodos para completar encuestas e informes</h4>
                    </div>
                    <div className="card-body">
                        <div className="card-body">
                            {error && <div className="alert alert-danger">{error}</div>}

                            <form>
                                {[
                                    ["inicio_encuesta", "Inicio encuestas"],
                                    ["fin_encuesta", "Fin encuestas"],
                                    ["inicio_informe_catedra", "Inicio informe cátedra"],
                                    ["fin_informe_catedra", "Fin informe cátedra"],
                                    ["inicio_informe_sintetico", "Inicio informe sintético"],
                                    ["fin_informe_sintetico", "Fin informe sintético"],
                                ].map(([campo, label]) => (
                                    <div className="mb-3" key={campo}>
                                        <label className="form-label fw-bold">{label}</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={form[campo as keyof typeof form]}
                                            onChange={e => setForm({ ...form, [campo]: e.target.value })}
                                        />
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleGuardar}
                                >
                                    Guardar fechas
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}