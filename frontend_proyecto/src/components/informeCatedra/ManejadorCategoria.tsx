import React, { useState } from 'react';

interface CategoriaTemp {
    cod: string;
    texto: string;
}

interface ManejadorCategoriaProps {
    categorias: CategoriaTemp[];
    setCategorias: React.Dispatch<React.SetStateAction<CategoriaTemp[]>>; 
    preguntas: any[]; 
    cargando: boolean;
}

export default function ManejadorCategoria({
    categorias,
    setCategorias,
    preguntas,
    cargando,
}: ManejadorCategoriaProps) {
    const [nuevaCategoriaCod, setNuevaCategoriaCod] = useState("");
    const [nuevaCategoriaTexto, setNuevaCategoriaTexto] = useState("");

    const agregarCategoria = () => {
        const codNormalizado = nuevaCategoriaCod.trim().toUpperCase();
        if (!codNormalizado) {
            alert("Debe ingresar un código para la categoría");
            return;
        }
        if (categorias.some(c => c.cod === codNormalizado)) {
            alert("Ya existe una categoría con ese código en esta lista");
            return;
        }

        setCategorias(prev => [...prev, { cod: codNormalizado, texto: nuevaCategoriaTexto }]);
        setNuevaCategoriaCod("");
        setNuevaCategoriaTexto("");
    };

    const eliminarCategoria = (cod: string) => {
        const preguntasAsociadas = preguntas.filter(p => p.categoria_cod === cod);
        if (preguntasAsociadas.length > 0) {
            if (!confirm(`Hay ${preguntasAsociadas.length} pregunta(s) asociada(s) a la categoría ${cod}. ¿Eliminar de todas formas?`)) {
                return;
            }
        }
        setCategorias(prev => prev.filter(c => c.cod !== cod));
    };

    return (
        <section>
            <h5 className="mb-3">1. Definición de Categorías (Bloques)</h5>
            
            <div className="card bg-light mb-4 p-3">
                <div className="row">
                    <div className="col-md-4 mb-2">
                        <input
                            type="text"
                            className="form-control"
                            value={nuevaCategoriaCod}
                            onChange={(e) => setNuevaCategoriaCod(e.target.value)}
                            disabled={cargando}
                        />
                    </div>
                    <div className="col-md-6 mb-2">
                        <input
                            type="text"
                            className="form-control"
                            value={nuevaCategoriaTexto}
                            onChange={(e) => setNuevaCategoriaTexto(e.target.value)}
                            placeholder="Texto / Descripción"
                            disabled={cargando}
                        />
                    </div>
                    <div className="col-md-2 mb-2">
                        <button
                            type="button"
                            className="btn btn-secondary w-100"
                            onClick={agregarCategoria}
                            disabled={cargando || !nuevaCategoriaCod.trim()}
                        >
                            Agregar
                        </button>
                    </div>
                </div>
            </div>

            {categorias.length > 0 && (
                <ul className="list-group mb-4">
                    {categorias.map((cat) => (
                        <li key={cat.cod} className="list-group-item d-flex justify-content-between align-items-center">
                            <span><strong>{cat.cod}</strong>: {cat.texto}</span>
                            <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() => eliminarCategoria(cat.cod)}
                                disabled={cargando}
                            >
                                Eliminar
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}