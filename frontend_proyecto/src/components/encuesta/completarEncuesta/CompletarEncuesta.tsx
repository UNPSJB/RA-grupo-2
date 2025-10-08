import { useEffect, useState } from "react";
import PreguntasCategoria from "./CategoriaB";
import MensajeExito from "../../pregunta/preguntaCerrada/MensajeExito";
import { useNavigate } from "react-router-dom";


interface Categoria {
  id: number;
  cod: string;
  texto: string;
}

interface Respuesta {
  pregunta_id: number;
  opcion_id: number;
}


export default function CompletarEncuesta() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [respuestasGlobales, setRespuestasGlobales] = useState<Respuesta[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const navigate = useNavigate();
  const [preguntasPorCategoria, setPreguntasPorCategoria] = useState<Record<number, number>>({});

  useEffect(() => {
    const codigosDeseados = ["A", "B", "C", "D", "E", "F", "G"];
    fetch("http://localhost:8000/encuestas/1/categorias")
      .then((res) => res.json())
      .then((todas: Categoria[]) => {
        const filtradas = todas.filter((c) => codigosDeseados.includes(c.cod));
        const ordenadas = [...filtradas].sort(
          (a, b) =>
            codigosDeseados.indexOf(a.cod) - codigosDeseados.indexOf(b.cod)
        );
        setCategorias(ordenadas);
      })
      .catch((err) => console.error("Error al obtener categorías:", err));
  }, []);

  const manejarCambioRespuestas = (pregunta_id: number, opcion_id: number) => {
    setRespuestasGlobales((prev) => {
      const existentes = prev.filter((r) => r.pregunta_id !== pregunta_id);
      return [...existentes, { pregunta_id, opcion_id }];
    });
  };

  const manejarTotalPreguntas = (categoriaId: number, cantidad: number) => {
    setPreguntasPorCategoria((prev) => ({ ...prev, [categoriaId]: cantidad }));
  };

  const totalPreguntas = Object.values(preguntasPorCategoria).reduce((a, b) => a + b, 0);

  const enviarEncuesta = async () => {
    if (respuestasGlobales.length < totalPreguntas) {
      setMensaje("Debes responder todas las preguntas antes de enviar.");
      console.log("Total preguntas:", totalPreguntas);
      console.log("Respuestas dadas:", respuestasGlobales.length);
      return;
    }

    setEnviando(true);
    setMensaje(null);

    const datos = {
      alumno_id: 3,
      encuesta_id: 1,
      materia_id: 4,
      anio: 2022,
      periodo: "SEGUNDO_CUATRI",
      respuestas: respuestasGlobales,
    };

    try {
      const res = await fetch(
        "http://localhost:8000/encuesta-completada/con-respuestas",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datos),
        }
      );

      if (!res.ok) throw new Error("Error al enviar encuesta");
      const data = await res.json();

      console.log("Encuesta completada creada:", data);
      setMensaje("Encuesta enviada con éxito.");
      setMensajeExito("¡La pregunta fue creada con éxito!");
      setRespuestasGlobales([]);
    } catch (err) {
      console.error(err);
      setMensaje("Error al enviar la encuesta.");
    } finally {
      setEnviando(false);
    }
  };

  function cerrarPagina(){
    setMensajeExito(null);
    navigate("/encuestas");
  }

  if (mensajeExito) {
    return (
      <MensajeExito
        mensaje={mensajeExito}
        onClose={cerrarPagina}
      />
    );
  }

  return (
    <div className="container py-4">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h1 className="h4 mb-0">Encuesta</h1>
        </div>
        <div className="card-body">
          {categorias.length > 0 ? (
            categorias.map((categoria) => (
              <div key={categoria.id} className="mb-4">
                <h2 className="h5 mb-3">
                  {categoria.cod}: {categoria.texto}
                </h2>
                <PreguntasCategoria
                  categoria={categoria}
                  onRespuesta={manejarCambioRespuestas}
                  onTotalPreguntas={manejarTotalPreguntas}
                />
              </div>
            ))
          ) : (
            <div className="alert alert-info">Cargando categorías...</div>
          )}

          <hr />
          <div className="text-center mt-4">
            <button
              onClick={enviarEncuesta}
              className="btn btn-success"
              disabled={enviando}
            >
              {enviando ? "Enviando..." : "Enviar Encuesta"}
            </button>
            {mensaje && <div className="mt-3 alert alert-info">{mensaje}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
