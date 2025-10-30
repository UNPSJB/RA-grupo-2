import Acordeon from "../acordeon/Acordeon";

interface OpcionPorcentaje {
  opcion_id: string;
  porcentaje: number;
}

interface DatosEstadisticosPregunta {
  id_pregunta: string;
  datos: OpcionPorcentaje[];
}

interface TablaProps {
  datos: DatosEstadisticosPregunta[];
  cant: number;
}

export default function TablaDatosEstadisticos({ datos , cant }: TablaProps) {
  if (!datos || datos.length === 0) {
    return (
      <div className="alert alert-info mt-4">
        No hay encuestas completadas
      </div>
    );
  }

  const contenido = (
    <div className="card-body">
      {datos.map((pregunta, i) => (
        <div key={i} className="mb-4">
          <h5 className="text-dark">
            {pregunta.id_pregunta}
          </h5>
          
          <table className="table table-striped table-bordered mt-2">
            <thead className="table-light">
              <tr>
                <th>Opción</th>
                <th>Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              {pregunta.datos.map((opcion, j) => (
                <tr key={j}>
                  <td>{opcion.opcion_id}</td>
                  <td>{opcion.porcentaje}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );

  return(
    <Acordeon
      titulo={`Datos Estadísticos - ${cant} encuestas completadas`}
      contenido={contenido}
    />
  );
}
