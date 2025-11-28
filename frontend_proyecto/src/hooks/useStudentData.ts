import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { ANIO_ACTUAL, PERIODO_ACTUAL } from "../constants";

interface EncuestaDisponible {
    materia: string;
    encuesta: string;
    materia_id: number;
    encuesta_id: number;
}

interface EncuestaCompletada {
    id: number;
    encuesta_id: number;
    materia_id: number;
    anio: number;        
    periodo: string;      
}

interface PeriodoFechas {
    inicio_encuesta: string;
    fin_encuesta: string;
}

export function useStudentData() {
    const { currentUser } = useAuth();
    const [fechas, setFechas] = useState<{ inicio: Date | null, fin: Date | null }>({ inicio: null, fin: null });
    const [progreso, setProgreso] = useState({ completadas: 0, pendientes: 0, total: 0, porcentaje: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const targetId = currentUser?.alumno_id || currentUser?.id;

            if (!targetId) return;
            try {
                setLoading(true);
                const reqFechas = api.get<PeriodoFechas>('/periodos_apertura/fechas_encuesta', {
                    params: { anio: ANIO_ACTUAL, periodo: PERIODO_ACTUAL }
                });
                const reqPendientes = api.get<EncuestaDisponible[]>(`/alumnos/${targetId}/encuestas_disponibles`);
                const reqCompletadas = api.get<EncuestaCompletada[]>(`/encuesta-completada/alumno/${targetId}`);

                const [resFechas, resPendientes, resCompletadas] = await Promise.all([
                    reqFechas, 
                    reqPendientes, 
                    reqCompletadas
                ]);
                if (resFechas.data) {
                    setFechas({
                        inicio: new Date(resFechas.data.inicio_encuesta + "T00:00:00"),
                        fin: new Date(resFechas.data.fin_encuesta + "T23:59:59")
                    });
                }
                const completadasFiltradas = resCompletadas.data.filter(enc => 
                    enc.anio === ANIO_ACTUAL && enc.periodo === PERIODO_ACTUAL
                );

                const cantPendientes = resPendientes.data.length;
                const cantCompletadas = completadasFiltradas.length;
                const total = cantPendientes + cantCompletadas;
                const porcentaje = total > 0 
                    ? Math.round((cantCompletadas / total) * 100) 
                    : 0;
                setProgreso({
                    completadas: cantCompletadas,
                    pendientes: cantPendientes,
                    total: total,
                    porcentaje: porcentaje
                });

            } catch (error: any) {
                if (error.response?.status === 404) {
                    console.warn("[useStudentData] Fechas o datos no encontrados.");
                } else {
                    console.error("[useStudentData] Error:", error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser]); 
    return { fechas, progreso, loading };
}