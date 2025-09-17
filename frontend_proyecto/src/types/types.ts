export interface Departamento {
  id: number;
  nombre: string;
  carreras: Carrera[];
}

export interface Carrera {
  id: number;
  nombre: string;
  departamento_id: number;
}


