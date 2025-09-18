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
