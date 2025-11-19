import { useEffect,useState } from "react";
import { ANIO_ACTUAL, PERIODO_ACTUAL } from "../../../constants";

function parseFechaLocal(fecha: string) {
        return new Date(fecha + "T00:00:00");
}

export function EsPeriodoEncuesta() {
    const [esPeriodo, setEsPeriodo] = useState<boolean>(false);

    useEffect(() => {
        fetch(`http://127.0.0.1:8000/periodos_apertura/?anio=${ANIO_ACTUAL}&periodo=${PERIODO_ACTUAL}`)
            .then(res => {
                if (res.status === 404) return null;
                if (!res.ok) throw new Error("Error al obtener el periodo de fechas");
                return res.json();
            })
            .then(data => {
                if (data) {

                    const hoy = new Date();
                    const inicio = parseFechaLocal(data.inicio_encuesta);
                    const fin = parseFechaLocal(data.fin_encuesta);

                    setEsPeriodo(hoy >= inicio && hoy <= fin);
                }
            })
            .catch(console.error);
    }, []); 

    return esPeriodo;
}

export function EsPeriodoInformeCatedra() {
    const [esPeriodo, setEsPeriodo] = useState<boolean>(false);

    useEffect(() => {
        fetch(`http://127.0.0.1:8000/periodos_apertura/?anio=${ANIO_ACTUAL}&periodo=${PERIODO_ACTUAL}`)
            .then(res => {
                if (res.status === 404) return null;
                if (!res.ok) throw new Error("Error al obtener el periodo de fechas");
                return res.json();
            })
            .then(data => {
                if (data) {

                    const hoy = new Date();
                    const inicio = parseFechaLocal(data.inicio_informe_catedra);
                    const fin = parseFechaLocal(data.fin_informe_catedra);

                    setEsPeriodo(hoy >= inicio && hoy <= fin);
                }
            })
            .catch(console.error);
    }, []); 

    return esPeriodo;
}


export function EsPeriodoInformeSintetico() {
    const [esPeriodo, setEsPeriodo] = useState<boolean>(false);

    useEffect(() => {
        fetch(`http://127.0.0.1:8000/periodos_apertura/?anio=${ANIO_ACTUAL}&periodo=${PERIODO_ACTUAL}`)
            .then(res => {
                if (res.status === 404) return null;
                if (!res.ok) throw new Error("Error al obtener el periodo de fechas");
                return res.json();
            })
            .then(data => {
                if (data) {

                    const hoy = new Date();
                    const inicio = parseFechaLocal(data.inicio_informe_sintetico);
                    const fin = parseFechaLocal(data.fin_informe_sintetico);

                    setEsPeriodo(hoy >= inicio && hoy <= fin);
                }
            })
            .catch(console.error);
    }, []); 

    return esPeriodo;
}