import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import ROUTES from "../../../paths";

interface Opcion {
  id: number;
  contenido: string;
}

interface Categoria {
  id: number;
  texto: string;
  cod: string;
}

interface Pregunta {
  id: number;
  enunciado: string;
  tipo: string;
  categoria_id: number;
  categoria: Categoria;
}

interface RespuestaConPregunta {
  id: number;
  texto_respuesta: string | null;
  opcion_id: number | null;
  pregunta: Pregunta;
}

interface InformeCompletadoDetalle {
  id: number;
  titulo: string | null;
  contenido: string | null;
  anio: number | null;
  periodo: string | null;
  respuestas_informe: RespuestaConPregunta[];
}

type GrupoDeRespuestas = {
  idCategoria: number;
  nombreCategoria: string;
  codCategoria: string;
  respuestas: RespuestaConPregunta[];
};

export function mostrarPeriodo(periodo: string) {
  switch (periodo) {
    case "PRIMER_CUATRI":
      return "Primer Cuatrimestre";
    case "SEGUNDO_CUATRI":
      return "Segundo Cuatrimestre";
    case "ANUAL":
      return "Anual";
    default:
      return periodo;
  }
}

export default function InformeCatedraDetalle() {
  const { id } = useParams<{ id: string }>();
  const [informe, setInforme] = useState<InformeCompletadoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapaCategorias, setMapaCategorias] = useState<Map<number, {texto: string, cod: string}>>(new Map());

  const [opciones, setOpciones] = useState<Record<number, Opcion[]>>({});

  const limpiarEnunciado = (enunciado: string): string => {
    return enunciado.replace(/\s*\(.*\)\s*$/, '').trim();
  };

  useEffect(() => {
    if (!id) {
      setError("ID de informe no proporcionado");
      setLoading(false);
      return;
    }

    const fetchInforme = fetch(`http://127.0.0.1:8000/informe-catedra-completado/${id}`)
      .then(res => res.ok ? res.json() : Promise.reject(new Error("Error al obtener el informe")));
    
    const fetchCategorias = fetch(`http://127.0.0.1:8000/categorias/`)
      .then(res => res.ok ? res.json() : Promise.reject(new Error("Error al obtener categorías")));

    Promise.all([fetchInforme, fetchCategorias])
      .then(async ([dataInforme, dataCategorias]: [InformeCompletadoDetalle, Categoria[]]) => {
        setInforme(dataInforme);
      
        const nuevoMapa = new Map<number, {texto: string, cod: string}>();
        dataCategorias.forEach(cat => { nuevoMapa.set(cat.id, { texto: cat.texto, cod: cat.cod });
        });
        setMapaCategorias(nuevoMapa);
        
        const opcionesTemp: Record<number, Opcion[]> = {};

        const buscarOpciones = dataInforme.respuestas_informe
          .filter(r => r.pregunta.tipo === 'cerrada' && r.pregunta.id)
          .map(async (r) => {
            const preguntaId = r.pregunta.id;
            if (opcionesTemp[preguntaId]) return;

            try{
              const resOpciones = await fetch(`http://127.0.0.1:8000/preguntas/${preguntaId}/opciones`);
              if(resOpciones.ok) {
                const ops: Opcion[] = await resOpciones.json();
                opcionesTemp[preguntaId] = ops;
              }
            } catch (e) {
              console.error(`Error al cargar opciones para pregunta ${preguntaId}:`, e);
            }
          });

        await Promise.all(buscarOpciones);
        setOpciones(opcionesTemp);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
          
  }, [id]);

  const gruposOrdenados = useMemo((): GrupoDeRespuestas[] => {
    if (!informe || mapaCategorias.size === 0) return [];

    const gruposTemp: Record<number, { id: number, nombre: string, cod: string, respuestas: RespuestaConPregunta[]} > = {};
    
    for (const respuesta of informe.respuestas_informe) {
      const catId = respuesta.pregunta.categoria_id;
      const catInfo = mapaCategorias.get(catId);
      const nombreCat = catInfo?.texto || `Categoría ID ${catId}`;
      const codCat = catInfo?.cod || `Z${catId}`;

      if (!gruposTemp[catId]) {
        gruposTemp[catId] = {id: catId, nombre: nombreCat, cod: codCat, respuestas: []};
      }
      gruposTemp[catId].respuestas.push(respuesta);
    }

    Object.values(gruposTemp).forEach(grupo => {
      grupo.respuestas.sort((a, b) => a.pregunta.id - b.pregunta.id);
    })

    const gruposComoArray = Object.values(gruposTemp);
    
    gruposComoArray.sort((a, b) => {
      const normalizarCodigo = (cod: string) => {
        if (/^\d+$/.test(cod)) {
          return cod.padStart(2, '0');
        }
        const numMatch = cod.match(/^\d+/);
        const letraMatch = cod.match(/[A-Za-z]+$/);
        if (numMatch && letraMatch) {
          return numMatch[0].padStart(2, '0') + letraMatch[0];
        }
        return cod;
      };

      const codA = normalizarCodigo(a.cod);
      const codB = normalizarCodigo(b.cod);
      
      return codA.localeCompare(codB);
    });

    return gruposComoArray.map(g => ({
      idCategoria: g.id,
      nombreCategoria: g.nombre,
      codCategoria: g.cod,
      respuestas: g.respuestas
    }));
  }, [informe, mapaCategorias]);

  const getRespuestaTexto = (r: RespuestaConPregunta): string => {
    if (r.pregunta.tipo === 'cerrada' && r.opcion_id) {
      const opcionesDePregunta = opciones[r.pregunta.id] || [];
      const opcionEncontrada = opcionesDePregunta.find(op => op.id === r.opcion_id);
      
      return opcionEncontrada ? opcionEncontrada.contenido : `[Opción ID: ${r.opcion_id}]`;
    }
    
    return r.texto_respuesta?.trim() || "—";
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>
          <Link to={ROUTES.INFORMES_CATEDRA} className="btn btn-outline-danger">
            Volver al listado
          </Link>
        </div>
      </div>
    );
  }

  if (!informe) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning" role="alert">
          No se encontró el informe solicitado.
        </div>
        <Link to={ROUTES.INFORMES_CATEDRA} className="btn btn-secondary">
          Volver al listado
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h1 className="h4 mb-0">{informe.titulo || "Informe sin título"}</h1>
        </div>
        
        <div className="card-body">
          <div className="alert alert-info">
            <div className="row">
              {informe.anio && (
                <div className="col-md-6">
                  <strong>Año:</strong> {informe.anio}
                </div>
              )}
              {informe.periodo && (
                <div className="col-md-6">
                  <strong>Período:</strong> {mostrarPeriodo(informe.periodo)}
                </div>
              )}
            </div>
            {informe.contenido && (
              <div className="mt-2">
                <strong>Contenido adicional:</strong>
                <p className="mb-0 mt-1" style={{ whiteSpace: 'pre-wrap' }}>
                  {informe.contenido}
                </p>
              </div>
            )}
          </div>

          <h5 className="mt-4 border-bottom pb-2">Respuestas del Informe</h5>

          {gruposOrdenados.length > 0 ? (
            gruposOrdenados.map((grupo) => (
              <div key={grupo.idCategoria} className="card shadow-sm mb-4">
                <div className="card-header bg-light">
                  <h6 className="fw-bold text mb-3">
                    {grupo.nombreCategoria}
                  </h6>
                </div>

                <div className="card-body">
                  <ul className="list-group list-group-flush">
                    {grupo.respuestas.map((r) => (
                      <li key={r.id} className="list-group-item px-0 py-3">
                        <strong className="d-block mb-0">
                          {limpiarEnunciado(r.pregunta.enunciado)}
                        </strong>
                        <p className="mb-0 text-muted" style={{ whiteSpace: 'pre-wrap' }}>
                          {getRespuestaTexto(r)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))
          ) : (
            <div className="alert alert-secondary mt-3">
              No hay respuestas registradas para este informe.
            </div>
          )}

          <Link to={ROUTES.INFORMES_CATEDRA} className="btn btn-secondary mt-4">
            Volver al listado
          </Link>
        </div>
      </div>
    </div>
  );
}