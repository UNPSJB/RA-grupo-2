import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { ANIO_ACTUAL, PERIODO_ACTUAL } from "../constants";

interface InformePendiente {
    materia_id: number;
    materia_nombre: string;
    docente_materia_id: number;
}

interface InformeCompletado {
    id: number;
    titulo: string;
    anio: number;
    periodo: string;
}

interface PeriodoFechas {
    inicio_informe_catedra: string;
    fin_informe_catedra: string;
}

export function useTeacherData() {
    const { currentUser } = useAuth();
    const [fechas, setFechas] = useState<{ inicio: Date | null, fin: Date | null }>({ inicio: null, fin: null });
    const [progreso, setProgreso] = useState({ completados: 0, pendientes: 0, total: 0, porcentaje: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const targetId = currentUser?.docente_id || currentUser?.id;

            if (!targetId) return;

            try {
                setLoading(true);
                const reqFechas = api.get<PeriodoFechas>('/periodos_apertura/fechas_informe_catedra', {
                    params: { anio: ANIO_ACTUAL, periodo: PERIODO_ACTUAL }
                });
                const reqPendientes = api.get<InformePendiente[]>(`/informe-catedra-completado/docente/${targetId}/pendientes`, {
                    params: { anio: ANIO_ACTUAL, periodo: PERIODO_ACTUAL }
                });
                const reqCompletados = api.get<InformeCompletado[]>(`/informe-catedra-completado/docente/${targetId}/completados`);

                const [resFechas, resPendientes, resCompletados] = await Promise.all([
                    reqFechas, 
                    reqPendientes,
                    reqCompletados
                ]);
                if (resFechas.data) {
                    setFechas({
                        inicio: new Date(resFechas.data.inicio_informe_catedra + "T00:00:00"),
                        fin: new Date(resFechas.data.fin_informe_catedra + "T23:59:59")
                    });
                }
                const completadosFiltrados = resCompletados.data.filter(inf => 
                    inf.anio === ANIO_ACTUAL && inf.periodo === PERIODO_ACTUAL
                );

                const cantPendientes = resPendientes.data.length;
                const cantCompletados = completadosFiltrados.length;
                const total = cantPendientes + cantCompletados;

                const porcentaje = total > 0 
                    ? Math.round((cantCompletados / total) * 100) 
                    : 0;

                setProgreso({
                    completados: cantCompletados,
                    pendientes: cantPendientes,
                    total: total,
                    porcentaje: porcentaje
                });

            } catch (error: any) {
                if (error.response?.status === 404) {
                    console.warn("[useTeacherData] Fechas o datos no encontrados (404).");
                } else {
                    console.error("[useTeacherData] Error cargando datos:", error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser]); 

    return { fechas, progreso, loading };
}