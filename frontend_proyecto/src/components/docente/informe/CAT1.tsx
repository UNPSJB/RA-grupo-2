import { useState, useMemo, useRef, useEffect, useCallback, type RefObject, type FC } from "react";

interface ItemFila {
  equipo: string;
  bibliografia: string;
}

interface RespuestaPlana {
  pregunta_id: number;
  texto_respuesta: string;
}

interface Pregunta { 
  id: number; 
  enunciado: string; 
  categoria_id: number; 
}

interface CategoriaConPreguntas { 
  cod: string; 
  texto: string; 
  preguntas: Pregunta[]; 
  id: number; 
}

interface Props {
  categoria: CategoriaConPreguntas;
  manejarCambioEstructura: (data: RespuestaPlana[]) => void; 
}

interface AutoExpandTextareaProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    style: React.CSSProperties; 
    disabled: boolean;
    className: string;
}

const AutoExpandTextarea: FC<AutoExpandTextareaProps> = ({ value, onChange, placeholder, style, disabled, className }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    const autoExpand = useCallback(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto'; 
            textarea.style.height = textarea.scrollHeight + 'px';
        }
    }, []);

    useEffect(() => {
        autoExpand();
    }, [value, autoExpand]);

    return (
        <textarea
            ref={textareaRef}
            className={className}
            rows={1} 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onInput={autoExpand}
            placeholder={placeholder}
            disabled={disabled}
            style={{ 
                ...style, 
                overflow: 'hidden', 
                resize: 'none', 
                minHeight: '38px',
                transition: 'height 0.1s ease',
                boxSizing: 'border-box',
            }}
        />
    );
};

export default function CategoriaEquipamiento({ categoria, manejarCambioEstructura }: Props) {
    
    const pEquipo = useMemo(() => 
      categoria.preguntas.find(p => p.enunciado.toLowerCase().includes("equipamiento")), 
      [categoria.preguntas]
    );
    
    const pBibliografia = useMemo(() => 
      categoria.preguntas.find(p => p.enunciado.toLowerCase().includes("bibliografia")), 
      [categoria.preguntas]
    );
    
    const EQUIPO_ID = pEquipo?.id;
    const BIBLIO_ID = pBibliografia?.id;

    const [filas, setFilas] = useState<ItemFila[]>([]);
    
    const [nuevoEquipo, setNuevoEquipo] = useState("");
    const [nuevaBibliografia, setNuevaBibliografia] = useState("");

    const inputEquipoRef = useRef<HTMLTextAreaElement>(null);
    const inputBiblioRef = useRef<HTMLTextAreaElement>(null);

    const autoExpandInput = (ref: RefObject<HTMLTextAreaElement | null>) => {
        const textarea = ref.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        }
    };

    const enviarRespuestasAlPadre = (currentFilas: ItemFila[]) => {
        if (!EQUIPO_ID || !BIBLIO_ID) return;

        const respuestasPlanas: RespuestaPlana[] = [];
        
        currentFilas.forEach(fila => {
            if (fila.equipo.trim() !== '') {
                 respuestasPlanas.push({ pregunta_id: EQUIPO_ID, texto_respuesta: fila.equipo.trim() });
            }
            if (fila.bibliografia.trim() !== '') {
                respuestasPlanas.push({ pregunta_id: BIBLIO_ID, texto_respuesta: fila.bibliografia.trim() });
            }
        });
        
        manejarCambioEstructura(respuestasPlanas);
    };

    const agregarFila = () => {
        if (nuevoEquipo.trim() === '' && nuevaBibliografia.trim() === '') {
            return;
        }

        const nuevaFila: ItemFila = {
            equipo: nuevoEquipo.trim(),
            bibliografia: nuevaBibliografia.trim(),
        };

        const nuevasFilas = [...filas, nuevaFila];
        setFilas(nuevasFilas);
        
        setNuevoEquipo("");
        setNuevaBibliografia("");
        
        if (inputEquipoRef.current) inputEquipoRef.current.style.height = '38px';
        if (inputBiblioRef.current) inputBiblioRef.current.style.height = '38px';

        enviarRespuestasAlPadre(nuevasFilas);
    };

    const eliminarFila = (index: number) => {
        const nuevasFilas = filas.filter((_, i) => i !== index);
        setFilas(nuevasFilas);
        enviarRespuestasAlPadre(nuevasFilas);
    };
    
    const manejarEdicionFila = (index: number, campo: 'equipo' | 'bibliografia', valor: string) => {
        const filasActualizadas = filas.map((fila, i) => 
            i === index ? { ...fila, [campo]: valor } : fila
        );
        setFilas(filasActualizadas);
        enviarRespuestasAlPadre(filasActualizadas); 
    };

    if (!pEquipo || !pBibliografia) {
        return <div className="alert alert-warning mt-3">Error: Preguntas de Equipamiento y/o Bibliografía no asociadas correctamente.</div>;
    }

    const inputFieldStyle = {
        backgroundColor: 'var(--color-input-bg)',
        color: 'var(--color-text-primary)',
        borderColor: 'var(--color-text-primary)',
        width: '100%',
        padding: '0.5rem',
    };
    const cardStyle = { 
        backgroundColor: 'var(--color-component-bg)',
        color: 'var(--color-text-primary)', 
    };
    
    const inputResponseStyle = {
        ...inputFieldStyle,
        padding: '0.5rem',
        backgroundColor: 'transparent',
        border: 'none',
        minHeight: '40px',
        borderRadius: 0,
    };
    
    const itemContainerStyle: React.CSSProperties = {
        padding: '10px 0',
        borderBottom: '1px dashed var(--color-text-primary, #ccc)',
        position: 'relative', 
    };

    const RESERVED_ACTION_SPACE = '40px'; 

    return (
        <div className="card-body p-0">
            <div className="p-4 border rounded" style={cardStyle}>
                
                <div className="row g-3 align-items-end mb-4 border-bottom pb-3">
                    
                    <div className="col-12 col-md-10">
                        <div className="d-flex gap-3">
                            <div className="w-50">
                                <label className="form-label fw-bold">Equipamiento/Insumo</label>
                                <textarea
                                    ref={inputEquipoRef}
                                    className="form-control"
                                    rows={1}
                                    placeholder="Escriba aquí el equipamiento a agregar"
                                    value={nuevoEquipo}
                                    onChange={(e) => setNuevoEquipo(e.target.value)}
                                    onInput={() => autoExpandInput(inputEquipoRef)}
                                    onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregarFila(); } }}
                                    style={{...inputFieldStyle, overflow: 'hidden', resize: 'none', minHeight: '38px'}}
                                />
                            </div>
                            
                            <div className="w-50">
                                <label className="form-label fw-bold">Bibliografía</label>
                                <textarea
                                    ref={inputBiblioRef}
                                    className="form-control"
                                    rows={1}
                                    placeholder="Escriba aquí la bibliografía a agregar"
                                    value={nuevaBibliografia}
                                    onChange={(e) => setNuevaBibliografia(e.target.value)}
                                    onInput={() => autoExpandInput(inputBiblioRef)}
                                    onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregarFila(); } }}
                                    style={{...inputFieldStyle, overflow: 'hidden', resize: 'none', minHeight: '38px'}}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="col-12 col-md-2 d-flex align-items-end">
                        <button
                            type="button"
                            className="btn btn-theme-primary w-100" 
                            onClick={agregarFila}
                            disabled={nuevoEquipo.trim() === '' && nuevaBibliografia.trim() === ''}
                            style={{ height: '38px' }} 
                        >
                            Agregar 
                        </button>
                    </div>
                </div>
                {filas.length > 0 && (
                    <div className="d-flex flex-column mt-4">
                        
                        <div className="d-flex fw-bold mb-2 pb-1" style={{ borderBottom: '2px solid var(--color-unpsjb-border)' }}>
                            <span style={{ flexBasis: '50%', paddingRight: '0.5rem' }}>Equipamiento e insumos</span>
                            <span style={{ flexBasis: '50%', paddingRight: RESERVED_ACTION_SPACE }}>Bibliografía</span>
                        </div>

                        {filas.map((fila, index) => (
                            <div 
                                key={index} 
                                className="d-flex align-items-start" 
                                style={itemContainerStyle}
                            >
                                <div style={{ flexBasis: '50%', paddingRight: '0.5rem' }}>
                                    <AutoExpandTextarea
                                        className="form-control border-0"
                                        value={fila.equipo}
                                        onChange={(value) => manejarEdicionFila(index, 'equipo', value)}
                                        placeholder="[Sin datos de equipamiento]"
                                        disabled={false}
                                        style={inputResponseStyle}
                                    />
                                </div>
                                
                                <div style={{ flexBasis: '50%', paddingRight: RESERVED_ACTION_SPACE }}>
                                    <AutoExpandTextarea
                                        className="form-control border-0"
                                        value={fila.bibliografia}
                                        onChange={(value) => manejarEdicionFila(index, 'bibliografia', value)}
                                        placeholder="[Sin datos de bibliografía]"
                                        disabled={false}
                                        style={inputResponseStyle}
                                    />
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-theme-danger"
                                    onClick={() => eliminarFila(index)}
                                    style={{ 
                                        position: 'absolute',
                                        right: '0',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: '25px', 
                                        height: '25px',
                                        borderRadius: '0', 
                                        padding: '0',
                                        fontSize: '1.2rem',
                                        lineHeight: '1.2rem',
                                        zIndex: 10,
                                        flexShrink: 0
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}