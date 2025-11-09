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

export interface Pregunta {
    id: number;
    cod: string;
    enunciado: string;
}

export interface Respuesta {
    pregunta_id: number;
    materia_id: number;
    texto_respuesta: string;
}
