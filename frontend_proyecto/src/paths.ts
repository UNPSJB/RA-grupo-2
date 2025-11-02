const ROUTES = {
  HOME: "/",

  //ALUMNOS
  ENCUESTAS_DISPONIBLES: "/alumnos/encuestas-disponibles",
  COMPLETAR_ENCUESTA: "/alumnos/encuestas_disponibles/completar",
  ENCUESTAS_COMPLETADAS: "/alumnos/encuestas-completadas",
  ENCUESTA_COMPLETADA_DETALLE: (id: number | string = ":id") => `/alumnos/encuestas-completadas/${id}`,

  //DOCENTES
  MATERIAS_ASIGNADAS: (id:number | string = ":id") => `/docentes/${id}/materias-asignadas`,
  DETALLE_MATERIA: (id: number | string = ":id") => `/docentes/materias-asignadas/${id}`,
  INFORMES_CATEDRA_PENDIENTES: "/docentes/informes-pendientes",
  COMPLETAR_INFORME_CATEDRA: "/docentes/informes-pendientes/completar",

  //DEPARTAMENTOS
  CARRERAS_DPTO: "/departamento/carreras",
  CARRERA: (id: number | string = ":id") => `/departamento/carreras/${id}`,
  INFORMES_CATEDRA: "/departamento/informes-catedra",
  INFORME_CATEDRA_DETALLE: (id: number | string = ":id") => `/departamento/informes-catedra/${id}`,

  //SECRETARÍA ACADÉMICA
  INFORMES_SINTETICOS: "/secretaria/informes-sinteticos",
  INFORME_SINTETICO_DETALLE: (id: number | string = ":id") => `/secretaria/informes-sinteticos/${id}`,
  INFORME_CATEDRA_BASE_NUEVO: "/secretaria/crear-informe-catedra-base",
  ENCUESTA_BASE_NUEVA: "/secretaria/crear-encuesta-base",
  INFORME_SINTETICO_BASE_NUEVO: "/secretaria/informe-sintetico/nuevo",
};

export default ROUTES;
