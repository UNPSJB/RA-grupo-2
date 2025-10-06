import DropdownOpciones from "./DropdownOpciones";

interface Pregunta {
  id: number;
  enunciado: string;
}

interface Opcion {
  id: number;
  contenido: string;
  pregunta_id: number;
}

interface Props {
  index: number;
  pregunta: Pregunta;
  opciones: Opcion[];
  seleccionada: number | null;
  dropdownAbierto: boolean;
  onToggle: () => void;
  onSeleccionar: (opcionId: number) => void;
}

export default function PreguntaItem({
  index,
  pregunta,
  opciones,
  seleccionada,
  dropdownAbierto,
  onToggle,
  onSeleccionar,
}: Props) {
  const opcionSeleccionada = opciones.find((o) => o.id === seleccionada);

  return (
    <div className="col-12 mb-3">
      <div className="card">
        <div className="card-body d-flex justify-content-between align-items-center">
          <div className="flex-grow-1">
            <span className="text-muted me-2">{index + 1}.</span>
            <span>{pregunta.enunciado}</span>
          </div>

          <DropdownOpciones
            opciones={opciones}
            abierta={dropdownAbierto}
            onToggle={onToggle}
            onSeleccionar={onSeleccionar}
            textoBoton={opcionSeleccionada ? opcionSeleccionada.contenido : "Seleccionar"}
            seleccionada={seleccionada}
          />
        </div>
      </div>
    </div>
  );
}
