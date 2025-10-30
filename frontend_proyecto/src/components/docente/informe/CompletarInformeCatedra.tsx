import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ANIO_ACTUAL } from "../../../constants";
import Categoria2BInforme from "./CAT2B";
import Categoria2CInforme from "./CAT2C";
import Categoria3Informe from "./CAT3";
import Categoria4Informe from "./CAT4";
import TablaDatosEstadisticos from "../../datosEstadisticos/TablaDatosEstadisticos";
import InformeCatedraCompletadoFuncion from "./CompletarInformeCatedraFuncion";
import ROUTES from "../../../paths";
import Acordeon from '../../acordeon/Acordeon';

import CategoriaEquipamiento from "./CAT1"
interface Pregunta {
  id: number;
  enunciado: string;
  categoria_id: number;
}

interface CategoriaConPreguntas {
  id: number;
  cod: string;
  texto: string;
  preguntas: Pregunta[];
}

interface OpcionPorcentaje {
  opcion_id: string;
  porcentaje: number;
}

interface DatosEstadisticosPregunta {
  id_pregunta: string;
  datos: OpcionPorcentaje[];
}

type RespuestaValor = {
  opcion_id: number | null;
  texto_respuesta: string | null;
};

export default function CompletarInformeCatedra() {
  const location = useLocation();
  const navigate = useNavigate();

  const [categoriasConPreguntas, setCategoriasConPreguntas] = useState<
    CategoriaConPreguntas[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [respuestas, setRespuestas] = useState<Record<number, RespuestaValor>>(
    {}
  );
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [datosEstadisticos, setDatosEstadisticos] = useState<
    DatosEstadisticosPregunta[]
  >([]);
  const [cantidadInscriptos, setCantidadInscriptos] = useState<number>(0);

  const [cantidadComisionesTeoricas, setCantidadComisionesTeoricas] = useState(1);
  const [cantidadComisionesPracticas, setCantidadComisionesPracticas] = useState(1);
  

  const {
    docenteMateriaId,
    materiaId,
    materiaNombre,
    anio,
    periodo,
    informeBaseId = 3,
  } = location.state || {};

  useEffect(() => {
    if (!informeBaseId) {
      setError("ID de informe base no encontrado.");
      setLoading(false);
      return;
    }

    fetch(
      `http://127.0.0.1:8000/informes_catedra/${informeBaseId}/categorias_con_preguntas`
    )
      .then((res) => {
        if (!res.ok)
          throw new Error("No se pudo cargar la estructura del informe.");
        return res.json();
      })
      .then((data: CategoriaConPreguntas[]) => {
        const dataOrdenada = [...data].sort((a, b) =>
          a.cod.localeCompare(b.cod, "es", { sensitivity: "base" })
        );

        setCategoriasConPreguntas(dataOrdenada);
        console.log(dataOrdenada);
        console.log("Informe Base ID:", informeBaseId);
        /*
        const respuestasIniciales: Record<number, string> = {};
        data.forEach((cat) => {
          cat.preguntas.forEach((p) => {
            respuestasIniciales[p.id] = "";
          });
        });
        setRespuestas(respuestasIniciales);
        */
      })
      .catch((err) => {
        console.error("Error fetching estructura informe:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [informeBaseId]);

  useEffect(() => {
    setDatosEstadisticos([]);

    fetch(
      `http://127.0.0.1:8000/datos_estadisticos/?id_materia=${materiaId}&anio=${anio}&periodo=${periodo}`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener los datos");
        return res.json();
      })
      .then((data) => {
        if (data.length != 0) {
          setDatosEstadisticos(data);
        }
      })
      .catch((error) => {
        console.error(error);
        setMensaje("Error al obtener los datos estadísticos.");
      })
      .finally(() => setLoading(false));
  }, [materiaId, anio, periodo]);

  const [cantidad, setCantidad] = useState<number>(0);
  useEffect(() => {
    fetch(
      `http://127.0.0.1:8000/datos_estadisticos/cantidad_encuestas_completadas?id_materia=${materiaId}&anio=${anio}&periodo=${periodo}`
    )
      .then((res) => {
        if (!res.ok)
          throw new Error("Error al obtener la cantidad de encuestas");
        return res.json();
      })
      .then((data) => {
        console.log("Cantidad de encuestas completadas:", data);
        setCantidad(data); // si tenés un useState
      })
      .catch((error) => {
        console.error(error);
      });
  }, [anio, materiaId, periodo]); // se ejecuta una sola vez

  const manejarCambio = (preguntaId: number, valor: RespuestaValor) => {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: valor }));
    if (mensaje && mensaje.includes("complete")) setMensaje(null);
  };

  /*
  const validarFormulario = (): boolean => {
    const totalPreguntas = categoriasConPreguntas.reduce(
      (acc, cat) => acc + cat.preguntas.length,
      0
    );
    const respondidas = Object.values(respuestas).filter(
      (r) => r && r.trim() !== ""
    ).length;
    return respondidas === totalPreguntas;
  };
  */

  const limpiarEnunciado = (texto: string) => {
    const parts = texto.split(". ");
    if (parts.length < 2) return texto;
    const prefijo = parts[0];
    if (!isNaN(parseInt(prefijo))) {
      return parts.slice(1).join(". ");
    }
    return texto;
  };

  const manejarDatosGenerados = (datos: any) => {
    setCantidadInscriptos(datos.cantidadAlumnos);
    setCantidadComisionesTeoricas(datos.cantidadComisionesTeoricas);
    setCantidadComisionesPracticas(datos.cantidadComisionesPracticas);
  };

  const enviarInforme = async () => {
    /*
    if (!validarFormulario()) {
      setMensaje("Por favor, complete todas las preguntas requeridas.");
      return;
    }
    */
    setEnviando(true);
    setMensaje(null);
    const respuestasFormateadas = Object.entries(respuestas).map(
      ([preguntaIdStr, respuestaObj]) => ({
        pregunta_id: parseInt(preguntaIdStr, 10),
        opcion_id: respuestaObj.opcion_id,
        texto_respuesta: respuestaObj.texto_respuesta,
      })
    );
    const datosParaBackend = {
      docente_materia_id: docenteMateriaId,
      informe_catedra_base_id: informeBaseId,
      titulo: `Informe ${materiaNombre} ${anio}`,
      contenido: `Informe para ${materiaNombre} (${periodo} ${anio})`,
      cantidadAlumnos: cantidadInscriptos,
      anio: ANIO_ACTUAL,
      periodo: periodo,
      cantidadComisionesTeoricas,
      cantidadComisionesPracticas,
      respuestas: respuestasFormateadas,
    };
    try {
      const res = await fetch(
        "http://127.0.0.1:8000/informe-catedra-completado/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datosParaBackend),
        }
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({
          detail: "Error desconocido al enviar.",
        }));
        throw new Error(errorData.detail || "Error al enviar el informe");
      }
      const data = await res.json();
      console.log("Informe creado:", data.id);

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/datos_estadisticos/guardar_datos/${data.id}`,
          { method: "POST" }
        );
        if (response.ok) {
          setMensaje("Datos estadísticos generados y guardados correctamente.");
        } else {
          setMensaje("Error al guardar los datos estadísticos.");
        }
      } catch (error) {
        console.error(error);
        setMensaje("Error al guardar datos estadisticos.");
      }
      setMensaje("¡Informe enviado con éxito!");
      setTimeout(() => {
        navigate(ROUTES.INFORMES_CATEDRA_PENDIENTES);
      }, 2000);
    } catch (err: Error | unknown) {
      console.error("Error enviando informe:", err);
      setMensaje(`Error: ${(err as Error).message}`);
    } finally {
      setEnviando(false);
    }
  };

  if (!docenteMateriaId || !materiaNombre) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger text-center">
          Error: Faltan datos para cargar el informe. Intenta volver a la lista.
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center mt-4">Cargando formulario...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center mt-4">Error: {error}</div>
    );
  }

  const renderCategoria = (categoria: CategoriaConPreguntas) => {

    const autoExpand = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const textarea = e.target;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    };

    switch (categoria.cod) {
      case "1":
        return (
          <CategoriaEquipamiento
            categoria={categoria}
            manejarCambio={manejarCambio}
          />
        );
      case "2.B":
        return (
          <Categoria2BInforme
            categoria={categoria}
            manejarCambio={manejarCambio}
            autoExpand={autoExpand}
          />
        );
      case "2.C":
        return (
          <Categoria2CInforme
            categoria={categoria}
            manejarCambio={manejarCambio}
          />
        );
      case "3":
        return (
          <Categoria3Informe
            categoria={categoria}
            manejarCambio={manejarCambio}
            autoExpand={autoExpand}
          />
        );
      case "4":
        return (
          <Categoria4Informe
            categoria={categoria}
            manejarCambio={manejarCambio}
            autoExpand={autoExpand}
          />
        );
      default:
      return (
        <div className="card-body p-0">
          {categoria.preguntas.map((pregunta, i) => (
            <div key={pregunta.id} className="mb-4 p-4 border rounded bg-light">
              <h6 className="fw-bold mb-3 text-dark border-bottom pb-2">
                {i + 1}. {limpiarEnunciado(pregunta.enunciado)}
                <span className="text-danger ms-1">*</span>
              </h6>
              <textarea
                id={`pregunta-${pregunta.id}`}
                className="form-control"
                rows={4}
                value={respuestas[pregunta.id]?.texto_respuesta || ""}
                onChange={(e) => {
                  manejarCambio(pregunta.id, {
                    opcion_id: null,
                    texto_respuesta: e.target.value,
                  });
                  autoExpand(e); 
                }}
                onInput={autoExpand} 
                placeholder="Escriba su respuesta aquí..."
                style={{ 
                  resize: 'none', 
                  minHeight: '100px',
                  overflow: 'hidden' 
                }}
              />
            </div>
          ))}
        </div>
      );
    }
  };


return (
  <div className="container-lg py-5">
    <div className="card border-0 shadow-lg rounded-4">
      <div className="card-header bg-primary text-white rounded-top-4">
        <h1 className="h4 mb-0 text-center">
          Informe de Cátedra – {materiaNombre}
        </h1>
      </div>

      <div className="card-body bg-light">
        <InformeCatedraCompletadoFuncion
          docenteMateriaId={docenteMateriaId}
          onDatosGenerados={manejarDatosGenerados}
        />

        <div className="accordion mt-3">
          <TablaDatosEstadisticos datos={datosEstadisticos} cant={cantidad} />

          {categoriasConPreguntas.map((categoria) => (
            <div key={categoria.id} className="mb-3">
              <Acordeon
                titulo={`${categoria.cod} - ${categoria.texto}`}
                contenido={renderCategoria(categoria)}
              />
            </div>
          ))}
        </div>

        <div className="text-center mt-4">
          <button
            onClick={enviarInforme}
            className="btn btn-primary btn-lg px-4 rounded-pill shadow-sm"
            disabled={enviando}
          >
            {enviando ? "Enviando..." : "Enviar Informe"}
          </button>

          {mensaje && (
            <div
              className={`mt-3 alert ${
                mensaje.includes("éxito") ? "alert-success" : "alert-danger"
              }`}
            >
              {mensaje}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
}