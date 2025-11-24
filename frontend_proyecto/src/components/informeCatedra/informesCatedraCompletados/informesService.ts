import api from "../../../services/api";

export async function fetchInformesCatedra() {
  const res = await api.get("/informe-catedra-completado/");
  return res.data;
}

export async function fetchInformeCatedra(id: string) {
  const res = await api.get(`/informe-catedra-completado/${id}`);
  return res.data;
}