const ROUTES = {
  HOME: "/menu",
  //LOGIN
  LOGIN: "/login",

  //ALUMNOS
  ENCUESTAS_DISPONIBLES: "/alumnos/encuestas-disponibles",
  COMPLETAR_ENCUESTA: "/alumnos/encuestas-disponibles/completar",
  ENCUESTAS_COMPLETADAS: "/alumnos/encuestas-completadas",
  ENCUESTA_COMPLETADA_DETALLE: (id: number | string = ":id") => `/alumnos/encuestas-completadas/${id}`,

  //DOCENTES
  INFORMES_CATEDRA_PENDIENTES: "/docentes/informes-pendientes",
  COMPLETAR_INFORME_CATEDRA: "/docentes/informes-pendientes/completar",
  INFORMES_CATEDRA_COMPLETADOS: "/docentes/informes-catedra-completados",
  INFORME_CATEDRA_COMPLETADO_DETALLE: (id: number | string = ":id") => `/docentes/informes-catedra-completados/${id}`,

  //DEPARTAMENTOS
  CARRERAS_DPTO: `/departamento/carreras`,
  CARRERA: (id: number | string = ":id") => `/departamento/carreras/${id}`,
  COMPLETAR_INFORME_SINTETICO: "/departamento/carreras/completar-informe-sintetico",
  INFORMES_CATEDRA: "/departamento/informes-catedra",
  INFORME_CATEDRA_DETALLE: (id: number | string = ":id") => `/departamento/informes-catedra/${id}`,
  DASHBOARD_DPTO: "/departamento/dashboard",
  INFORMES_SINTETICOS_COMPLETADOS: `/departamento/informes-sinteticos-completados`,
  INFORME_SINTETICO_DETALLE: (id: number | string = ":id") => `/departamento/informes-sinteticos-completados/${id}`,
  
  //SECRETARÍA ACADÉMICA
  INFORMES_SINTETICOS: "/secretaria/informes-sinteticos-completados",
  INFORME_SINTETICO_DETALLE_SECRETARIA: (id: number | string = ":id") => `/secretaria/informes-sinteticos/${id}`, 
  INFORME_CATEDRA_BASE_NUEVO: "/secretaria/crear-informe-catedra-base",
  ENCUESTA_BASE_NUEVA: "/secretaria/crear-encuesta-base",
  INFORME_SINTETICO_BASE_NUEVO: "/secretaria/informe-sintetico/nuevo",
  ASIGNAR_MATERIA_INFORME: "/secretaria/asignar-materia-informe",
  INFORMACION_GENERAL_DEPARTAMENTO: "/secretaria/informacion-general-departamento",
  DEFINIR_FECHAS: "/secretaria/definir-fechas"
};

export default ROUTES;