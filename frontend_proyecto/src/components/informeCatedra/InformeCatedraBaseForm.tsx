import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CategoriaManager from "./ManejadorCategoria"; 
import OpcionesManager from "./ManejadorOpciones";  
import ROUTES from "../../paths"; 
import api from "../../services/api";

interface CategoriaTemp { cod: string; texto: string; }
interface PreguntaTemp { 
    enunciado: string; 
    categoria_cod: string; 
    tipo: 'abierta' | 'cerrada'; 
    opcion_ids: number[]; 
    obligatoria: boolean; 
}
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
    const [esObligatoria, setEsObligatoria] = useState(false);

    useEffect(() => {
        api.get("/opciones")
            .then((res) => {
                const data = res.data;
                setOpcionesCatalogo(Array.isArray(data) ? data : []);
            })
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
            obligatoria: esObligatoria,
        };

        setPreguntas(prev => [...prev, nuevaPregunta]);
        setNuevoEnunciado("");
        setOpcionesSeleccionadas([]);
        setEsObligatoria(false);
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
            const resInforme = await api.post("/informes_catedra/", { titulo });
            const { id: informeId } = resInforme.data;
            const categoriasCreadas = [];
            
            for (const categoriaTemp of categorias) {
                const resCat = await api.post("/categorias/paraInforme/", {
                    cod: categoriaTemp.cod,
                    texto: categoriaTemp.texto || "",
                    informe_base_id: informeId,
                });
                const categoriaCreada = resCat.data;
                categoriasCreadas.push(categoriaCreada);
            }

            for (const preg of preguntas) {
                const categoria = categoriasCreadas.find((c) => c.cod === preg.categoria_cod);
                if (!categoria) continue;
                const endpoint = preg.tipo === 'cerrada' ? "/preguntas/cerrada" : "/preguntas/abierta";   
                const payload = {
                    categoria_id: categoria.id,
                    enunciado: preg.enunciado,
                    tipo: preg.tipo,
                    obligatoria: preg.obligatoria,
                    ...(preg.tipo === 'cerrada' && { opcion_ids: preg.opcion_ids }),
                };
                await api.post(endpoint, payload);
            }

            alert("Informe creado con éxito.");
            navigate(ROUTES.HOME);

        } catch (error: any) {
            console.error("Error en la cascada de creación:", error);
            const messageToShow = error.response?.data?.detail || error.message || "Error desconocido al procesar la solicitud.";
            alert(`Fallo en la creación del informe. Error: ${messageToShow}`);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="container py-4">
            <div className="card shadow">
                <div className="card-header bg-unpsjb-header">
                    <h1 className="h4 mb-0">Nuevo Informe de Cátedra Base</h1>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4 p-3 border rounded">
                            <label className="form-label fw-bold">Título del Informe</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                value={titulo} 
                                onChange={(e) => setTitulo(e.target.value)} 
                                required 
                                disabled={cargando}
                            />
                        </div>
                        <CategoriaManager
                            categorias={categorias}
                            setCategorias={setCategorias}
                            preguntas={preguntas}
                            cargando={cargando}
                        />
                        
                        <h5 className="mb-3">2. Definición de Preguntas</h5>
                        <div className="card mb-4 p-3"> 
                            <div className="row mb-3">
                                <div className="col-md-3">
                                    <label className="form-label fw-bold">Tipo</label>
                                    <select 
                                        className="form-select" 
                                        value={nuevoTipoPregunta} 
                                        onChange={(e) => { setNuevoTipoPregunta(e.target.value as 'abierta' | 'cerrada'); setOpcionesSeleccionadas([]); }} 
                                        disabled={cargando || categorias.length === 0}
                                    >
                                        <option value="abierta">Abierta</option>
                                        <option value="cerrada">Cerrada</option>
                                    </select>
                                </div>
                                <div className="col-md-9">
                                    <label className="form-label fw-bold">Categoría</label>
                                    <select 
                                        className="form-select" 
                                        value={categoriaSeleccionada} 
                                        onChange={(e) => setCategoriaSeleccionada(e.target.value)} 
                                        disabled={cargando || categorias.length === 0}
                                    >
                                        <option value="">Seleccione categoría</option>
                                        {categorias.map((cat) => ( <option key={cat.cod} value={cat.cod}>{cat.cod} {cat.texto ? `- ${cat.texto}` : ''}</option> ))}
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
                                />
                            </div>

                            <div className="mb-3 form-check">
                                <input 
                                    type="checkbox" 
                                    className="form-check-input" 
                                    id="checkObligatoriaInforme" 
                                    checked={esObligatoria}
                                    onChange={(e) => setEsObligatoria(e.target.checked)}
                                    disabled={cargando || categorias.length === 0}
                                />
                                <label className="form-check-label fw-bold" htmlFor="checkObligatoriaInforme">
                                    Marque si la pregunta es obligatoria de responder
                                </label>
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
                                    <li key={i} className={`list-group-item d-flex justify-content-between align-items-center`}>
                                        <span>
                                            <strong className={`badge ${preg.tipo === 'cerrada' ? 'bg-primary' : 'bg-secondary'} me-2`}>{preg.tipo.toUpperCase()}</strong>
                                            {preg.obligatoria && <span className="badge bg-danger me-2">OBLIGATORIA</span>}
                                            <strong> [{preg.categoria_cod}]</strong> {preg.enunciado}
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