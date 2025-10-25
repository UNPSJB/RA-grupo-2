import { useEffect, useState, useCallback } from "react";
import { useRespuestasCAT3 } from "./useRespuestasCAT3";

interface Pregunta {
  id: number;
  enunciado: string;
  categoria_id: number;
}

interface Categoria {
  id: number;
  cod: string;
  texto: string;
  preguntas: Pregunta[];
}

interface Props {
  categoria: Categoria;
  onRespuestasChange?: (respuestas: any[]) => void;
}

const CONFIGURACION = {
  TIPOS: [
    "capacitación",
    "investigación", 
    "extensión",
    "gestión",
    "observaciones"
  ],
  ANCHOS_COLUMNAS: ['20%', '16%', '16%', '16%', '16%', '16%'],
  
  ROLES: [
    { nombre: 'Profesor', termino: 'profesor' },
    { nombre: 'JTP', termino: 'jtp' },
    { nombre: 'Auxiliar', termino: 'auxiliar' },
    { nombre: 'Auxiliar de Segunda', termino: 'auxiliar_de_segunda' }
  ]
};

export default function Categoria3Informe({ categoria, onRespuestasChange }: Props) {
  const [preguntasBase, setPreguntasBase] = useState<Pregunta[]>([]);
  const [respuestasLocales, setRespuestasLocales] = useState<Record<string, string>>({});
  
  const { agregarRespuesta, obtenerRespuestasFormateadas } = useRespuestasCAT3();

  useEffect(() => {
    if (!categoria) return;

    const buscarPreguntasBase = () => {
      return CONFIGURACION.TIPOS.map(tipo => {
        return categoria.preguntas.find(p => 
          p.enunciado.toLowerCase().includes(tipo.toLowerCase())
        );
      }).filter(Boolean) as Pregunta[];
    };

    const preguntasEncontradas = buscarPreguntasBase();
    setPreguntasBase(preguntasEncontradas);

    const respuestasIniciales: Record<string, string> = {};
    CONFIGURACION.ROLES.forEach(rolConfig => {
      CONFIGURACION.TIPOS.forEach(tipo => {
        const respuestaId = `${rolConfig.termino}_${tipo}`;
        respuestasIniciales[respuestaId] = '';
      });
    });
    setRespuestasLocales(respuestasIniciales);
  }, [categoria]);


  useEffect(() => {
    if (onRespuestasChange) {
      const respuestasFormateadas = obtenerRespuestasFormateadas(categoria);
      onRespuestasChange(respuestasFormateadas);
    }
  }, [respuestasLocales, categoria, onRespuestasChange, obtenerRespuestasFormateadas]);

  const manejarCambioRespuesta = useCallback((rol: string, tipo: string, valor: string) => {
    const identificadorUnico = `${rol}_${tipo}`;
    
  
    setRespuestasLocales(prev => ({
      ...prev,
      [identificadorUnico]: valor
    }));

   
    const preguntaBase = preguntasBase.find(p => 
      p.enunciado.toLowerCase().includes(tipo.toLowerCase())
    );

    if (preguntaBase) {
      agregarRespuesta(identificadorUnico, valor, rol, tipo, preguntaBase.id);
    }
  }, [preguntasBase, agregarRespuesta]);

  const obtenerRespuesta = (rol: string, tipo: string): string => {
    const identificadorUnico = `${rol}_${tipo}`;
    return respuestasLocales[identificadorUnico] || '';
  };

  const renderizarFila = (rolConfig: {nombre: string, termino: string}) => {
    if (preguntasBase.length !== CONFIGURACION.TIPOS.length) {
      return (
        <tr key={rolConfig.nombre}>
          <td colSpan={6} className="text-center text-muted">
            Faltan preguntas base ({preguntasBase.length}/5 encontradas)
          </td>
        </tr>
      );
    }

    return (
      <tr key={rolConfig.nombre}>
        <td>
          <div className="fw-bold">{rolConfig.nombre}</div>
        </td>
        {CONFIGURACION.TIPOS.map((tipo) => (
          <td key={`${rolConfig.termino}_${tipo}`}>
            <textarea
              className="form-control form-control-sm"
              rows={3}
              value={obtenerRespuesta(rolConfig.termino, tipo)}
              onChange={(e) => manejarCambioRespuesta(rolConfig.termino, tipo, e.target.value)}
            />
          </td>
        ))}
      </tr>
    );
  };

  return (
    <div className="card mt-3">
      <div className="card-header bg-primary text-white">
        <strong>{categoria.cod} - {categoria.texto}</strong>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-bordered m-0">
            <thead className="table-light text-center">
              <tr>
                <th style={{ width: CONFIGURACION.ANCHOS_COLUMNAS[0] }}>Rol</th>
                {CONFIGURACION.TIPOS.map((tipo) => (
                  <th key={tipo} style={{ width: CONFIGURACION.ANCHOS_COLUMNAS[1] }}>
                    {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CONFIGURACION.ROLES.map(renderizarFila)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}