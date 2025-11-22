import { useEffect, useState } from "react";
// instancia api
import api from "../../../services/api";
import { ANIO_ACTUAL, PERIODO_ACTUAL } from "../../../constants";

function parseFechaLocal(fecha: string) {
        return new Date(fecha + "T00:00:00");
}

export function EsPeriodoEncuesta() {
    const [esPeriodo, setEsPeriodo] = useState<boolean>(false);

    useEffect(() => {
        api.get('/periodos_apertura/', {
            params: {
                anio: ANIO_ACTUAL,
                periodo: PERIODO_ACTUAL
            }
        })
        .then(res => {
            const data = res.data;
            if (data) {
                const hoy = new Date();
                const inicio = parseFechaLocal(data.inicio_encuesta);
                const fin = parseFechaLocal(data.fin_encuesta);

                setEsPeriodo(hoy >= inicio && hoy <= fin);
            }
        })
        .catch(err => {
            if (err.response && err.response.status === 404) {
                return;
            }
            console.error("Error verificando periodo encuesta:", err);
        });
    }, []); 

    return esPeriodo;
}

export function EsPeriodoInformeCatedra() {
    const [esPeriodo, setEsPeriodo] = useState<boolean>(false);

    useEffect(() => {
        api.get('/periodos_apertura/', {
            params: {
                anio: ANIO_ACTUAL,
                periodo: PERIODO_ACTUAL
            }
        })
        .then(res => {
            const data = res.data;
            if (data) {
                const hoy = new Date();
                const inicio = parseFechaLocal(data.inicio_informe_catedra);
                const fin = parseFechaLocal(data.fin_informe_catedra);

                setEsPeriodo(hoy >= inicio && hoy <= fin);
            }
        })
        .catch(err => {
            if (err.response && err.response.status === 404) {
                return;
            }
            console.error("Error verificando periodo informe cátedra:", err);
        });
    }, []); 

    return esPeriodo;
}


export function EsPeriodoInformeSintetico() {
    const [esPeriodo, setEsPeriodo] = useState<boolean>(false);

    useEffect(() => {
        api.get('/periodos_apertura/', {
            params: {
                anio: ANIO_ACTUAL,
                periodo: PERIODO_ACTUAL
            }
        })
        .then(res => {
            const data = res.data;
            if (data) {
                const hoy = new Date();
                const inicio = parseFechaLocal(data.inicio_informe_sintetico);
                const fin = parseFechaLocal(data.fin_informe_sintetico);

                setEsPeriodo(hoy >= inicio && hoy <= fin);
            }
        })
        .catch(err => {
            if (err.response && err.response.status === 404) {
                return;
            }
            console.error("Error verificando periodo informe sintético:", err);
        });
    }, []); 

    return esPeriodo;
}