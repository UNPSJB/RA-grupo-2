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
    const cardStyle = { 
        backgroundColor: 'var(--color-component-bg)',
        color: 'var(--color-text-primary)',
        borderColor: 'var(--color-text-primary)',
    };

    const inputFieldStyle = {
        backgroundColor: 'var(--color-input-bg)',
        color: 'var(--color-text-primary)',
        borderColor: 'var(--color-text-primary)',
    };
    
    const listItemStyle = {
        backgroundColor: 'var(--color-input-bg)',
        color: 'var(--color-text-primary)',
        borderColor: 'var(--color-text-primary)',
    }

    return (
        <section>
            <h5 className="mb-3" style={{color: 'var(--color-text-primary)'}}>1. Definición de Categorías</h5>
            
            <div className="card mb-4 p-3" style={cardStyle}>
                <div className="row">
                    <div className="col-md-4 mb-2">
                        <input
                            type="text"
                            className="form-control"
                            value={nuevaCategoriaCod}
                            onChange={(e) => setNuevaCategoriaCod(e.target.value)}
                            disabled={cargando}
                            style={inputFieldStyle} 
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
                            style={inputFieldStyle} 
                        />
                    </div>
                    <div className="col-md-2 mb-2">
                        <button
                            type="button"
                            className="btn btn-secondary w-100 rounded-pill" // APLICADO: rounded-pill
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
                        <li key={cat.cod} className="list-group-item d-flex justify-content-between align-items-center" style={listItemStyle}>
                            <span><strong>{cat.cod}</strong>: {cat.texto}</span>
                            <button
                                type="button"
                                className="btn btn-theme-danger btn-sm rounded-pill" 
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