export interface Departamento {
  id: number;
  nombre: string;
  carreras: Carrera[];
}

export interface Carrera {
  id: number;
  nombre: string;
  departamento_id: number;
  informe_base_id: number;
}
export interface Materia {
  id: number;
  nombre: string;
  matricula: string;
}

export interface Docente {
  docente_id: number;
  nombre: string;
  apellido: string;
  materias: Materia[];
}
