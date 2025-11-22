import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Importamos la instancia configurada de axios
import api from "../../services/api"; 
import CategoriaManager from "./ManejadorCategoria"; 
import OpcionesManager from "./ManejadorOpciones";  
import ROUTES from "../../paths"; 

interface CategoriaTemp { cod: string; texto: string; }
interface PreguntaTemp { enunciado: string; categoria_cod: string; tipo: 'abierta' | 'cerrada'; opcion_ids: number[]; }
interface Opcion { id: number; contenido: string; }

export default function InformeCatedraBaseForm() {
    const navigate = useNavigate();
    const [titulo, setTitulo] = useState("");
    const [cargando, setCargando] = useState(false);

    const [categorias, setCategorias] = useState<CategoriaTemp[]>([]);
    const [preguntas, setPreguntas] = useState<PreguntaTemp[]>([]);
    const [opcionesCatalogo, setOpcionesCatalogo] = useState<Opcion[]>([]); 

    const [nuevoEnunciado, setNuevoEnunciado] = useState("");
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
    const [nuevoTipoPregunta, setNuevoTipoPregunta] = useState<'abierta' | 'cerrada'>('abierta'); 
    const [opcionesSeleccionadas, setOpcionesSeleccionadas] = useState<number[]>([]); 
    
    useEffect(() => {
        // Usamos la instancia 'api'. No hace falta poner http://localhost... ni hacer .json()
        api.get("/opciones")
            .then((res) => setOpcionesCatalogo(Array.isArray(res.data) ? res.data : []))
            .catch((err) => console.error("Error cargando opciones:", err));
    }, []);

    const agregarPregunta = () => {
        if (!nuevoEnunciado.trim() || !categoriaSeleccionada || categorias.length === 0) {
            alert("Debe ingresar enunciado y seleccionar una categoría.");
            return;
        }
        if (nuevoTipoPregunta === 'cerrada' && opcionesSeleccionadas.length === 0) {
            alert("Las preguntas cerradas deben tener al menos una opción.");
            return;
        }

        const nuevaPregunta: PreguntaTemp = {
            enunciado: nuevoEnunciado,
            categoria_cod: categoriaSeleccionada,
            tipo: nuevoTipoPregunta,
            opcion_ids: nuevoTipoPregunta === 'cerrada' ? opcionesSeleccionadas : [],
        };

        setPreguntas(prev => [...prev, nuevaPregunta]);
        setNuevoEnunciado("");
        setOpcionesSeleccionadas([]);
    };

    const eliminarPregunta = (index: number) => {
        setPreguntas(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!titulo.trim() || categorias.length === 0 || preguntas.length === 0) {
            alert("Complete todos los campos y agregue al menos una categoría y una pregunta.");
            return;
        }

        setCargando(true);

        try {
            // 1. CREAR EL INFORME BASE
            let informeId: number;
            try {
                const resInforme = await api.post("/informes_catedra/", { titulo });
                informeId = resInforme.data.id;
            } catch (error: any) {
                // Axios guarda la respuesta del servidor en error.response
                throw new Error(error.response?.data?.detail || "Error al crear el informe base."); 
            }

            const categoriasCreadas = [];
            
            // 2. CREAR LAS CATEGORÍAS
            for (const categoriaTemp of categorias) {
                try {
                    const resCat = await api.post("/categorias/paraInforme/", { 
                        cod: categoriaTemp.cod,
                        texto: categoriaTemp.texto || "",
                        informe_base_id: informeId,
                    });
                    categoriasCreadas.push(resCat.data);
                } catch (error: any) {
                    throw new Error(error.response?.data?.detail || `Error al crear categoría ${categoriaTemp.cod}. El código ya está en uso.`); 
                }
            }

            // 3. CREAR LAS PREGUNTAS
            for (const preg of preguntas) {
                const categoria = categoriasCreadas.find((c) => c.cod === preg.categoria_cod);
                if (!categoria) continue; 
                
                const endpoint = preg.tipo === 'cerrada' ? "/preguntas/cerrada" : "/preguntas/abierta";   
                
                const payload = {
                    categoria_id: categoria.id,
                    enunciado: preg.enunciado,
                    tipo: preg.tipo, 
                    ...(preg.tipo === 'cerrada' && { opcion_ids: preg.opcion_ids }), 
                };

                try {
                    await api.post(endpoint, payload);
                } catch (error: any) {
                     throw new Error(error.response?.data?.detail || `Error al crear la pregunta: ${preg.enunciado}`);
                }
            }

            alert("Informe creado con éxito.");
            navigate(ROUTES.HOME);

        } catch (error) {
            console.error("Error en la cascada de creación:", error);
            const messageToShow = error instanceof Error ? error.message : "Error desconocido al procesar la solicitud.";
            alert(`Fallo en la creación del informe. Error: ${messageToShow}`);
        } finally {
            setCargando(false);
        }
    };

    // ESTILOS
    const cardStyle = { 
        backgroundColor: 'var(--color-component-bg)',
        border: '1px solid var(--color-unpsjb-border)', 
        color: 'var(--color-text-primary)' 
    };

    const cardHeaderStyle = {
        backgroundColor: 'var(--color-unpsjb-blue)', 
        color: 'white',
    };

    const inputAreaStyle = { 
        backgroundColor: 'var(--color-component-bg)',
        color: 'var(--color-text-primary)', 
        borderColor: 'var(--color-unpsjb-border)'
    };
    
    const inputFieldStyle = {
        backgroundColor: 'var(--color-input-bg)',
        color: 'var(--color-text-primary)',
        borderColor: 'var(--color-unpsjb-border)',
    };

    return (
        <div className="container py-4">
            <div className="card shadow" style={cardStyle}>
                <div style={cardHeaderStyle} className="card-header bg-unpsjb-header">
                    <h1 className="h4 mb-0">Nuevo Informe de Cátedra Base</h1>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>  
                        {/* TÍTULO DEL INFORME */}
                        <div className="mb-4 p-3 border rounded" style={inputAreaStyle}> 
                            <label className="form-label fw-bold">Título del Informe</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                value={titulo} 
                                onChange={(e) => setTitulo(e.target.value)} 
                                required 
                                disabled={cargando}
                                style={inputFieldStyle}
                            />
                        </div>
                        
                        <CategoriaManager
                            categorias={categorias}
                            setCategorias={setCategorias}
                            preguntas={preguntas}
                            cargando={cargando}
                        />
                        
                        <h5 className="mb-3" style={{color: 'var(--color-text-primary)'}}>2. Definición de Preguntas</h5>
                        <div className="card mb-4 p-3" style={inputAreaStyle}> 
                            <div className="row mb-3">
                                <div className="col-md-3">
                                    <label className="form-label fw-bold">Tipo</label>
                                    <select 
                                        className="form-select" 
                                        value={nuevoTipoPregunta} 
                                        onChange={(e) => { setNuevoTipoPregunta(e.target.value as 'abierta' | 'cerrada'); setOpcionesSeleccionadas([]); }} 
                                        disabled={cargando || categorias.length === 0}
                                        style={inputFieldStyle}
                                    >
                                        <option value="abierta" style={inputFieldStyle}>Abierta</option>
                                        <option value="cerrada" style={inputFieldStyle}>Cerrada</option>
                                    </select>
                                </div>
                                <div className="col-md-9">
                                    <label className="form-label fw-bold">Categoría</label>
                                    <select 
                                        className="form-select" 
                                        value={categoriaSeleccionada} 
                                        onChange={(e) => setCategoriaSeleccionada(e.target.value)} 
                                        disabled={cargando || categorias.length === 0}
                                        style={inputFieldStyle}
                                    >
                                        <option value="" style={inputFieldStyle}>Seleccione categoría</option>
                                        {categorias.map((cat) => ( <option key={cat.cod} value={cat.cod} style={inputFieldStyle}>{cat.cod} {cat.texto ? `- ${cat.texto}` : ''}</option> ))}
                                    </select>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Enunciado</label>
                                <textarea 
                                    className="form-control" 
                                    rows={2} 
                                    value={nuevoEnunciado} 
                                    onChange={(e) => setNuevoEnunciado(e.target.value)} 
                                    disabled={cargando || categorias.length === 0}
                                    style={inputFieldStyle}
                                />
                            </div>
                            {nuevoTipoPregunta === 'cerrada' && (
                                <OpcionesManager
                                    opcionesCatalogo={opcionesCatalogo}
                                    opcionesSeleccionadas={opcionesSeleccionadas}
                                    setOpcionesSeleccionadas={setOpcionesSeleccionadas}
                                    setOpcionesCatalogo={setOpcionesCatalogo}
                                    cargando={cargando}
                                />
                            )}
                            <div className="d-flex justify-content-end mt-2">
                                <button 
                                    type="button" 
                                    className="btn btn-theme-primary rounded-pill" 
                                    onClick={agregarPregunta} 
                                    disabled={cargando || categorias.length === 0 || !nuevoEnunciado.trim() || !categoriaSeleccionada || (nuevoTipoPregunta === 'cerrada' && opcionesSeleccionadas.length === 0)} 
                                >
                                    Agregar Pregunta a la Lista
                                </button>
                            </div>
                        </div>
                        {preguntas.length > 0 && (
                            <ul className="list-group mb-4">
                                {preguntas.map((preg, i) => (
                                    <li key={i} className={`list-group-item d-flex justify-content-between align-items-center`} style={inputAreaStyle}>
                                        <span>
                                            <strong className={`badge ${preg.tipo === 'cerrada' ? 'bg-primary' : 'bg-secondary'} me-2`}>{preg.tipo.toUpperCase()}</strong>
                                            <strong style={{color: 'var(--color-text-primary)'}}> [{preg.categoria_cod}]</strong> {preg.enunciado}
                                        </span>
                                        <button 
                                            type="button" 
                                            className="btn btn-theme-danger btn-sm rounded-pill" 
                                            onClick={() => eliminarPregunta(i)} 
                                            disabled={cargando}
                                        >
                                            Eliminar
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="d-flex justify-content-end gap-2 border-top pt-3">
                            <button 
                                type="button" 
                                className="btn btn-secondary rounded-pill" 
                                onClick={() => navigate(ROUTES.HOME)} 
                                disabled={cargando}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className="btn btn-theme-primary rounded-pill" 
                                disabled={cargando}
                            >
                                {cargando ? "Guardando en cascada..." : "Guardar Informe Completo"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}