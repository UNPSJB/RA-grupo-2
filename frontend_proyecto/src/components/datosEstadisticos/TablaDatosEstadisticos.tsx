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

  return (
    <div className="card mt-4">
      <div className="card-header bg-primary text-white">
        <h2 className="h5 mb-0">Datos Estadísticos - {cant} encuestas completadas</h2>
      </div>

      <div className="card-body">
        {datos.map((pregunta, i) => (
          <div key={i} className="mb-4">
            <h5 className="text-primary">
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
    </div>
  );
}
