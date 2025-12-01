import ROUTES from "../paths";

export interface MenuItem {
  title: string;
  to: string;
}

export const getRoleLinks = (role: string): MenuItem[] => {
  const baseLinks: MenuItem[] = [];

  // --- SECRETARÍA ACADÉMICA ---
  if (role === 'secretaria_academica') {
    baseLinks.push(
      { title: "Crear Informe de Cátedra Base", to: ROUTES.INFORME_CATEDRA_BASE_NUEVO },
      { title: "Crear Encuesta Base", to: ROUTES.ENCUESTA_BASE_NUEVA },
      { title: "Asignar Formularios a Materias", to: ROUTES.ASIGNAR_MATERIA_INFORME },
      { title: "Definir fechas de apertura", to: ROUTES.DEFINIR_FECHAS },
      { title: "Informes Sintéticos", to: ROUTES.INFORMES_SINTETICOS }
    );
  }

  // --- ALUMNOS ---
  if (role === 'alumno') {
    baseLinks.push(
      { title: "Encuestas Disponibles", to: ROUTES.ENCUESTAS_DISPONIBLES },
      { title: "Encuestas Completadas", to: ROUTES.ENCUESTAS_COMPLETADAS }
    );
  }

  // --- DOCENTES ---
  if (role === 'docente') {
    baseLinks.push(
      { title: "Informes Pendientes", to: ROUTES.INFORMES_CATEDRA_PENDIENTES },
      { title: "Informes Completados", to: ROUTES.INFORMES_CATEDRA_COMPLETADOS }
    );
  }

  // --- DEPARTAMENTO ---
  if (role === 'departamento') {
    baseLinks.push(
      { title: "Inf. Sintéticos Pendientes", to: ROUTES.CARRERAS_DPTO},
      { title: "Inf. Sintéticos Completados", to: ROUTES.INFORMES_SINTETICOS_COMPLETADOS},
      { title: "Informes de Cátedra", to: ROUTES.INFORMES_CATEDRA }
    );
  }

  // --- ADMIN ---
  if (role === 'admin') {
    baseLinks.push(
      { title: "Encuestas Disp.", to: ROUTES.ENCUESTAS_DISPONIBLES },
      { title: "Informes Pendientes", to: ROUTES.INFORMES_CATEDRA_PENDIENTES },
      { title: "Informes Sintéticos", to: ROUTES.CARRERAS_DPTO},
      { title: "Crear Informe Base", to: ROUTES.INFORME_CATEDRA_BASE_NUEVO },
      { title: "Definir Fechas", to: ROUTES.DEFINIR_FECHAS }
    );
  }

  return baseLinks;
};