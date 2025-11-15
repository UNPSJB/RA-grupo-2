const BASE_URL = "http://localhost:8000/informes_sinteticos_completados"; 
const BASE_URL_PREGUNTAS = "http://localhost:8000/preguntas_sintetico"; 
export async function fetchInformes() {
  const res = await fetch(`${BASE_URL}/completados/`);
  if (!res.ok) {
    console.error(`Error al obtener lista de informes: ${res.status} ${res.statusText}`);
    return []; 
  }
  const data = await res.json();
  return Array.isArray(data) ? data : []; 
}

export async function fetchInforme(id: string) {
  const res = await fetch(`${BASE_URL}/completados/${id}`);
  if (!res.ok) {
    throw new Error(`Fallo al obtener detalle del informe ${id}.`);
  }
  return res.json();
}
export async function fetchPreguntasBase(informeBaseId: number) {
    const res = await fetch(`${BASE_URL_PREGUNTAS}/base/${informeBaseId}`);
    if (!res.ok) {
        throw new Error(`Fallo al obtener las preguntas base del informe ${informeBaseId}: ${res.statusText}`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
}
