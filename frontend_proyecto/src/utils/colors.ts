export const getCssVariableName = (opcion: string): string => {
  const op = opcion.toLowerCase();
  
  // Ciclo Básico
  if (op.startsWith('si')) return '--color-grafico-verde';
  if (op.startsWith('no')) return '--color-grafico-rojo';
  if (op.startsWith('npo')) return '--color-grafico-amarillo';

  // Ciclo Superior
  if (op.startsWith('muy bueno')) return '--color-grafico-verde';
  if (op.startsWith('bueno')) return '--color-grafico-cyan';
  if (op.startsWith('regular')) return '--color-grafico-amarillo';
  if (op.startsWith('malo')) return '--color-grafico-rojo';

  return '--color-grafico-gris';
};


export const getResolvedColor = (cssVariableName: string): string => {
  if (typeof window === 'undefined') {
    return cssVariableName;
  }
  const resolvedValue = window.getComputedStyle(document.documentElement)
                        .getPropertyValue(cssVariableName);
  return resolvedValue ? resolvedValue.trim() : cssVariableName;
};

export const getColorsByOption = (opcion: string) => {
  const op = opcion.toLowerCase();
  
  if (op.startsWith('muy bueno') || op.startsWith('si')) {
    return { 
      fuerte: getResolvedColor('--color-grafico-verde'), 
      suave: getResolvedColor('--color-fondo-suave-verde')
    };
  }
  if (op.startsWith('bueno')) {
    return { 
      fuerte: getResolvedColor('--color-grafico-cyan'), 
      suave: getResolvedColor('--color-fondo-suave-azul')
    };
  }
  if (op.startsWith('regular') || op.startsWith('npo')) {
    return { 
      fuerte: getResolvedColor('--color-grafico-amarillo'), 
      suave: getResolvedColor('--color-fondo-suave-amarillo')
    };
  }
  if (op.startsWith('malo') || op.startsWith('no')) {
    return { 
      fuerte: getResolvedColor('--color-grafico-rojo'), 
      suave: getResolvedColor('--color-fondo-suave-rojo')
    };
  }

  return { fuerte: getResolvedColor('--color-grafico-gris'), suave: 'white' };
};

export const getColorParaOpcion = (opcion: string): string => {
    const colorObj = getColorsByOption(opcion);

    return colorObj.fuerte; 
};