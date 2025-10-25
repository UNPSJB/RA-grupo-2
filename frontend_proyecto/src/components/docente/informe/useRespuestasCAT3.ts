import { useState, useCallback } from 'react';

export interface RespuestaCAT3 {
  identificador: string;
  texto: string;
  rol: string;
  tipo: string;
  preguntaBaseId: number;
}

export const useRespuestasCAT3 = () => {
  const [respuestasCAT3, setRespuestasCAT3] = useState<RespuestaCAT3[]>([]);

  const agregarRespuesta = useCallback((
    identificador: string, 
    texto: string, 
    rol: string, 
    tipo: string, 
    preguntaBaseId: number
  ) => {
    setRespuestasCAT3(prev => {
      const filtered = prev.filter(r => r.identificador !== identificador);
      return [...filtered, { 
        identificador, 
        texto, 
        rol, 
        tipo, 
        preguntaBaseId
      }];
    });
  }, []);

  const obtenerRespuestasFormateadas = useCallback((categoria: any) => {
    return respuestasCAT3.map(respuesta => {
      const preguntaBase = categoria?.preguntas.find((p: any) => 
        p.enunciado.toLowerCase().includes(respuesta.tipo.toLowerCase())
      );

      return {
        pregunta_id: preguntaBase?.id || respuesta.preguntaBaseId,
        opcion_id: null,
        texto_respuesta: respuesta.texto,
      };
    }).filter(r => r.pregunta_id !== undefined && r.texto_respuesta.trim() !== '');
  }, [respuestasCAT3]);

  const limpiarRespuestas = useCallback(() => {
    setRespuestasCAT3([]);
  }, []);

  return {
    respuestasCAT3,
    agregarRespuesta,
    obtenerRespuestasFormateadas,
    limpiarRespuestas
  };
};