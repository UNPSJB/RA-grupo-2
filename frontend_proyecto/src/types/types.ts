export interface Sede {
  id: number;
  nombre: string;
}

export interface Departamento {
  id: number;
  nombre: string;
  carreras: Carrera[];
  sede_id?: number;
  sede?: Sede;
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
  departamento?: Departamento
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
    orden: number;
    enunciado: string;
}

export interface Respuesta {
    pregunta_id: number;
    materia_id?: number;
    texto_respuesta: string;
}

export interface Categoria {
  id: number;
  texto: string;
  cod: string;
}
export interface RespuestaInformeSintetico {
  id: number;
  pregunta_id: number;
  materia_id: number | null;
  informe_completado_id: number;
  texto_respuesta: string | null;
  opcion_id: number | null;
  materia?: Materia; 
}


export interface InformeCompletado {
  id: number;
  titulo: string;
  anio: number;
  periodo: string;
  contenido: string;
  informe_base_id: number;
  carrera_id: number;
  departamento_id: number; 
  respuestas: RespuestaInformeSintetico[]; 
}
export interface Alumno {
  id: number
  nombre: string
  apellido: string
}