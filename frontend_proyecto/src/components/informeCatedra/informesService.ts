// src/services/informesService.ts
export async function fetchInformesCatedra() {
  const res = await fetch("http://localhost:8000/informes_catedra/");
  return res.json();
}

export async function fetchInformeCatedra(id: string) {
  const res = await fetch(`http://localhost:8000/informes_catedra/${id}`);
  return res.json();
}
