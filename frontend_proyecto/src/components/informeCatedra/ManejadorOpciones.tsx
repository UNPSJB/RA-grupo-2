import React, { useState } from 'react';

interface Opcion {
    id: number;
    contenido: string;
}

interface ManejadorOpcionesProps {
    opcionesCatalogo: Opcion[];
    opcionesSeleccionadas: number[];
    setOpcionesSeleccionadas: React.Dispatch<React.SetStateAction<number[]>>;
    setOpcionesCatalogo: React.Dispatch<React.SetStateAction<Opcion[]>>;
    cargando: boolean;
}

export default function ManejadorOpciones({
    opcionesCatalogo,
    opcionesSeleccionadas,
    setOpcionesSeleccionadas,
    setOpcionesCatalogo,
    cargando,
}: ManejadorOpcionesProps) {
    const [nuevaOpcionContenido, setNuevaOpcionContenido] = useState("");

    const toggleOpcion = (id: number) => {
        setOpcionesSeleccionadas(prev => 
          prev.includes(id) ? prev.filter((oid) => oid !== id) : [...prev, id]
        );
    };

    const handleCrearNuevaOpcion = () => {
        if (!nuevaOpcionContenido.trim()) {
            alert("Ingrese contenido para la nueva opción.");
            return;
        }
        
        fetch("http://localhost:8000/opciones", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contenido: nuevaOpcionContenido }),
        })
          .then((res) => {
              if (!res.ok) throw new Error("Fallo al crear la opción.");
              return res.json();
          })
          .then((data: Opcion) => {
            setOpcionesCatalogo(prev => [...prev, data]);
            setOpcionesSeleccionadas(prev => [...prev, data.id]);
            setNuevaOpcionContenido("");
          })
          .catch((err) => {
              console.error("Error creando opción:", err);
              alert("Error al crear la opción. Revise el backend.");
          });
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
        <div className="mb-3 border p-3 rounded" style={cardStyle}>
            <h6 className="fw-bold">Opciones para Respuesta Cerrada</h6>
            <label className="form-label">Seleccionar Opciones existentes:</label>
            <div className="list-group mb-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                {opcionesCatalogo.map((opcion) => (
                    <label key={opcion.id} className="list-group-item d-flex align-items-center" style={listItemStyle}>
                        <input
                            type="checkbox"
                            className="form-check-input me-2"
                            checked={opcionesSeleccionadas.includes(opcion.id)}
                            onChange={() => toggleOpcion(opcion.id)}
                            disabled={cargando}
                        />
                        {opcion.contenido}
                    </label>
                ))}
            </div>
            <label className="form-label">Crear Nueva Opción:</label>
            <div className="d-flex">
                <input
                    type="text"
                    className="form-control me-2"
                    value={nuevaOpcionContenido}
                    onChange={(e) => setNuevaOpcionContenido(e.target.value)}
                    placeholder="Contenido de nueva opción"
                    disabled={cargando}
                    style={inputFieldStyle} 
                />
                <button
                    type="button"
                    className="btn btn-theme-success" 
                    onClick={handleCrearNuevaOpcion}
                    disabled={cargando || !nuevaOpcionContenido.trim()}
                >
                    Crear
                </button>
            </div>
            {opcionesSeleccionadas.length > 0 && <p className="mt-2 small" style={{color: 'var(--color-text-primary)'}}>Opciones seleccionadas: {opcionesSeleccionadas.length}</p>}
        </div>
    );
}