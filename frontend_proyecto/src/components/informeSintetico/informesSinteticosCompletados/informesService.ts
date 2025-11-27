import api from "../../../services/api"; 

export async function fetchInformes(id_dpto?: number) { 
  try {
    const res = await api.get("/informes_sinteticos_completados/completados/", {
      params: { id_dpto }
    });
    
    return Array.isArray(res.data) ? res.data : []; 
  } catch (error) {
    console.error("Error al obtener lista de informes:", error);
    return []; 
  }
}

export async function fetchInforme(id: string) {
  try {
    const res = await api.get(`/informes_sinteticos_completados/completados/${id}`);
    return res.data;
  } catch (error) {
    console.error(error)
    throw new Error(`Fallo al obtener detalle del informe ${id}.`);
  }
}

export async function fetchPreguntasBase(informeBaseId: number) {
  try {
    const res = await api.get(`/preguntas_sintetico/base/${informeBaseId}`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (error: any) {
    const msg = error.response?.statusText || "Error desconocido";
    throw new Error(`Fallo al obtener las preguntas base del informe ${informeBaseId}: ${msg}`);
  }
}