import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { ANIO_ACTUAL, PERIODO_ACTUAL } from "../constants";

interface PeriodoFechas {
    inicio_informe_sintetico: string;
    fin_informe_sintetico: string;
}

interface InformeCompletado {
    id: number;
    anio: number;
    periodo: string;
}

interface DepartamentoData {
    id: number;
    nombre: string;
    carreras?: any[]; 
}

interface Carrera {
    id: number;
    nombre: string;
}

export function useDepartmentData() {
    const { currentUser } = useAuth();
    const [fechas, setFechas] = useState<{ inicio: Date | null, fin: Date | null }>({ inicio: null, fin: null });
    const [progreso, setProgreso] = useState({ completadas: 0, pendientes: 0, total: 0, porcentaje: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const deptoId = currentUser?.departamento_id;
            
            if (!deptoId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const reqFechas = api.get<PeriodoFechas>('/periodos_apertura/fechas_informe_sintetico', {
                    params: { anio: ANIO_ACTUAL, periodo: PERIODO_ACTUAL }
                });

                const reqCompletados = api.get<InformeCompletado[]>('/informes_sinteticos_completados/completados/', {
                    params: { id_dpto: deptoId }
                });

                const reqCarreras = api.get<Carrera[]>(`/departamentos/${deptoId}/carreras`);

                const [resFechas, resCompletados, resCarreras] = await Promise.all([
                    reqFechas,
                    reqCompletados,
                    reqCarreras
                ]);

                if (resFechas.data) {
                    setFechas({
                        inicio: new Date(resFechas.data.inicio_informe_sintetico + "T00:00:00"),
                        fin: new Date(resFechas.data.fin_informe_sintetico + "T23:59:59")
                    });
                }

                const completadosFiltrados = (resCompletados.data || []).filter(inf => 
                    inf.anio === ANIO_ACTUAL && inf.periodo === PERIODO_ACTUAL
                );

                const totalCarreras = resCarreras.data ? resCarreras.data.length : 0;
                
                const total = totalCarreras;
                const completadas = completadosFiltrados.length;
                const pendientes = Math.max(0, total - completadas);

                const porcentaje = total > 0 
                    ? Math.round((completadas / total) * 100) 
                    : 0;

                setProgreso({
                    completadas,
                    pendientes,
                    total,
                    porcentaje
                });

            } catch (error: any) {
                if (error.response?.status === 404) {
                    console.warn("[useDepartmentData] Datos no encontrados (404).");
                } else {
                    console.error("[useDepartmentData] Error cargando datos:", error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser]);

    return { fechas, progreso, loading };
}