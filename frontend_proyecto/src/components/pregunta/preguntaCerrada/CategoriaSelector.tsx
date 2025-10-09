interface Categoria {
  id: number;
  cod: string;
  texto: string;
}

interface CategoriaSelectorProps {
  categorias: Categoria[];
  categoriaSeleccionada: string;
  onChange: (id: string) => void;
}

export default function CategoriaSelector({
  categorias,
  categoriaSeleccionada,
  onChange,
}: CategoriaSelectorProps) {
  return (
    <div className="mb-3">
      <label className="form-label fw-bold">Categoría</label>
      <select
        className="form-select"
        value={categoriaSeleccionada}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Seleccione una categoría</option>
        {categorias.map((cat) => (
          <option key={cat.id} value={String(cat.id)}>
            {cat.cod} - {cat.texto}
          </option>
        ))}
      </select>
    </div>
  );
}
