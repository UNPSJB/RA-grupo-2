import { useEffect, useState } from "react";
import PreguntaItem from "./PreguntaItem";
import type { Categoria } from "../../../types/types";

interface Pregunta {
  id: number;
  enunciado: string;
  categoria_id: number;
  encuesta_id: number;
  tipo: "cerrada" | "abierta"; 
  obligatoria?: boolean ;
}

interface Opcion {
  id: number;
  contenido: string;
  pregunta_id: number;
}

interface Respuesta {
  pregunta_id: number;
  opcion_id: number | null;
  texto_respuesta?: string | null;
}

interface PreguntaMetadata {
  id: number;
  enunciado: string;
  obligatoria: boolean;
}

interface Props {
  categoria: Categoria;
  onRespuesta: (pregunta_id: number, opcion_id: number | null, texto?: string) => void;
  onQuestionsLoaded?: (catId: number, preguntas: PreguntaMetadata[]) => void;
  respuestasGlobales: Respuesta[];
}

export default function PreguntasCategoria({ categoria, onRespuesta, onQuestionsLoaded, respuestasGlobales }: Props) {
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [opciones, setOpciones] = useState<Record<number, Opcion[]>>({});
  const [dropdownAbierto, setDropdownAbierto] = useState<number | null>(null);

  useEffect(() => {
    fetch(`http://localhost:8000/categorias/${categoria.id}/preguntas`)
      .then((res) => res.json())
      .then((data: Pregunta[]) => {
        setPreguntas(data);
        if (onQuestionsLoaded) {
            onQuestionsLoaded(categoria.id, data.map(p => ({ 
                id: p.id, 
                enunciado: p.enunciado,
                obligatoria: Boolean(Number(p.obligatoria)) 
            })));
        }
      })
      .catch((err) => console.error(err));
  }, [categoria.id]);

  const cargarOpciones = (preguntaId: number) => {
    if (opciones[preguntaId]) return;
    fetch(`http://localhost:8000/preguntas/${preguntaId}/opciones`)
      .then((res) => res.json())
      .then((data : Opcion[]) => {
        setOpciones((prev) => ({ ...prev, [preguntaId]: data }));
      })
      .catch((err) => console.error(err));
  };

  const seleccionarOpcion = (preguntaId: number, opcionId: number) => {
    onRespuesta(preguntaId, opcionId, undefined);
    setDropdownAbierto(null);
  };

  const actualizarRespuestaTexto = (preguntaId: number, texto: string) => {
    onRespuesta(preguntaId, null, texto);
  };

  const getRespuestaActual = (preguntaId: number) => {
    const resp = respuestasGlobales.find(r => r.pregunta_id === preguntaId);
    return {
        opcion_id: resp?.opcion_id || null,
        texto: resp?.texto_respuesta || ""
    };
  };

  return (
    <div>
      {preguntas.length === 0 ? (
        <div className="alert alert-warning">No hay preguntas disponibles.</div>
      ) : (
        preguntas.map((p, i) => {
            const respuestaActual = getRespuestaActual(p.id);
            return (
              <PreguntaItem
                key={p.id}
                index={i}
                pregunta={p}
                opciones={opciones[p.id] || []}
                seleccionada={respuestaActual.opcion_id}
                texto={respuestaActual.texto || ""}
                esAbierta={p.tipo === "abierta"}
                dropdownAbierto={dropdownAbierto === p.id}
                onToggle={async () => {
                  if (dropdownAbierto === p.id) setDropdownAbierto(null);
                  else {
                    await cargarOpciones(p.id);
                    setDropdownAbierto(p.id);
                  }
                }}
                onSeleccionar={(opcionId) => seleccionarOpcion(p.id, opcionId)}
                onChangeTexto={(texto) => actualizarRespuestaTexto(p.id, texto)}
              />
            );
        })
      )}
    </div>
  );
}