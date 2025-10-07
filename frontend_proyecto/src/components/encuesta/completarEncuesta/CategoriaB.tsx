import { useEffect, useState } from "react";
import PreguntaItem from "./PreguntaItem";

interface Categoria {
  id: number;
  cod: string;
  texto: string;
}

interface Pregunta {
  id: number;
  enunciado: string;
  categoria_id: number;
  encuesta_id: number;
}

interface Opcion {
  id: number;
  contenido: string;
  pregunta_id: number;
}

interface Props {
  categoria: Categoria;
  onRespuesta: (pregunta_id: number, opcion_id: number) => void;
}

export default function PreguntasCategoria({ categoria, onRespuesta }: Props) {
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [opciones, setOpciones] = useState<Record<number, Opcion[]>>({});
  const [respuestas, setRespuestas] = useState<Record<number, number | null>>({});
  const [dropdownAbierto, setDropdownAbierto] = useState<number | null>(null);

  useEffect(() => {
    fetch(`http://localhost:8000/categorias/${categoria.id}/preguntas`)
      .then((res) => res.json())
      .then((data: Pregunta[]) => {
        setPreguntas(data);
        const inicial: Record<number, number | null> = {};
        data.forEach((p) => (inicial[p.id] = null));
        setRespuestas(inicial);
      })
      .catch((err) =>
        console.error("Error al obtener preguntas de la categoría:", err)
      );
  }, [categoria.id]);

const cargarOpciones = (preguntaId: number) => {
  if (opciones[preguntaId]) return;

  fetch(`http://localhost:8000/preguntas/${preguntaId}/opciones`)
    .then((res) => res.json())
    .then((data : Opcion[]) => {
      const lista = data;
      setOpciones((prev) => ({ ...prev, [preguntaId]: lista }));
    })
    .catch((err) => console.error("Error al cargar opciones:", err));
};

  const seleccionarOpcion = (preguntaId: number, opcionId: number) => {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: opcionId }));
    setDropdownAbierto(null);
    onRespuesta(preguntaId, opcionId); // 👈 notifica al padre
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
            seleccionada={respuestas[p.id]}
            dropdownAbierto={dropdownAbierto === p.id}
            onToggle={async () => {
              if (dropdownAbierto === p.id) setDropdownAbierto(null);
              else {
                await cargarOpciones(p.id);
                setDropdownAbierto(p.id);
              }
            }}
            onSeleccionar={(opcionId) => seleccionarOpcion(p.id, opcionId)}
          />
        ))
      )}
    </div>
  );
}