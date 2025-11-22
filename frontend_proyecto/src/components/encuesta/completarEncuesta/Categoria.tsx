import { useEffect, useState } from "react";
import PreguntaItem from "./PreguntaItem";
import type { Categoria } from "../../../types/types";
import api from "../../../services/api";

interface Pregunta {
  id: number;
  enunciado: string;
  categoria_id: number;
  encuesta_id: number;
  tipo: "cerrada" | "abierta";
}

interface Opcion {
  id: number;
  contenido: string;
  pregunta_id: number;
}

interface Props {
  categoria: Categoria;
  onRespuesta: (pregunta_id: number, opcion_id: number | null, texto?: string) => void;
  onTotalPreguntas?: (id: number, cantidad: number) => void;
}

export default function PreguntasCategoria({ categoria, onRespuesta, onTotalPreguntas }: Props) {
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [opciones, setOpciones] = useState<Record<number, Opcion[]>>({});
  const [respuestas, setRespuestas] = useState<Record<number, { opcion_id: number | null; texto?: string }>>({});
  const [dropdownAbierto, setDropdownAbierto] = useState<number | null>(null);
  const [categoriaNotificada, setCategoriaNotificada] = useState(false);

  // Cargar preguntas
  useEffect(() => {
    api.get<Pregunta[]>(`/categorias/${categoria.id}/preguntas`)
      .then((res) => {
        const data = res.data; 
        setPreguntas(data);
        const inicial: Record<number, { opcion_id: number | null; texto?: string }> = {};
        data.forEach((p) => (inicial[p.id] = { opcion_id: null, texto: "" }));
        setRespuestas(inicial);
      })
      .catch((err) =>
        console.error("Error al obtener preguntas de la categoría:", err)
      );
  }, [categoria.id]);

  // Notificar cantidad de preguntas en un efecto separado
  useEffect(() => {
    if (preguntas.length > 0 && !categoriaNotificada && onTotalPreguntas) {
      // Usar setTimeout para sacarlo del ciclo de render actual
      setTimeout(() => {
        onTotalPreguntas(categoria.id, preguntas.length);
        setCategoriaNotificada(true);
      }, 0);
    }
  }, [preguntas, categoria.id, categoriaNotificada, onTotalPreguntas]);

  const cargarOpciones = (preguntaId: number) => {
    if (opciones[preguntaId]) return;
    api.get<Opcion[]>(`/preguntas/${preguntaId}/opciones`)
      .then((res) => {
        const data = res.data; 
        setOpciones((prev) => ({ ...prev, [preguntaId]: data }));
      })
      .catch((err) => console.error("Error al cargar opciones:", err));
  };

  const seleccionarOpcion = (preguntaId: number, opcionId: number) => {
    setRespuestas((prev) => {
      const nuevaRespuesta = { ...prev[preguntaId], opcion_id: opcionId };
      onRespuesta(preguntaId, opcionId, nuevaRespuesta.texto);
      return { ...prev, [preguntaId]: nuevaRespuesta };
    });
    setDropdownAbierto(null);
  };

  const actualizarRespuestaTexto = (preguntaId: number, texto: string) => {
    setRespuestas((prev) => {
      const nuevaRespuesta = { ...prev[preguntaId], texto };
      onRespuesta(preguntaId, nuevaRespuesta.opcion_id, texto);
      return { ...prev, [preguntaId]: nuevaRespuesta };
    });
  };

  return (
    <div>
      {preguntas.length === 0 ? (
        <div className="alert alert-warning">
          No hay preguntas disponibles para esta categoría.
        </div>
      ) : (
        preguntas.map((p, i) => (
          <PreguntaItem
            key={p.id}
            index={i}
            pregunta={p}
            opciones={opciones[p.id] || []}
            seleccionada={respuestas[p.id]?.opcion_id || null}
            texto={respuestas[p.id]?.texto || ""}
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
        ))
      )}
    </div>
  );
}