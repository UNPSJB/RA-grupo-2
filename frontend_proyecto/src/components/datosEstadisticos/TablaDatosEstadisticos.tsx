interface OpcionPorcentaje {
  opcion_id: string;
  porcentaje: number;
}

interface DatosEstadisticosPregunta {
  id_pregunta: string;
  datos: OpcionPorcentaje[];
}

interface DatosEstadisticosCategoria {
  categoria_cod: string;
  categoria_texto: string;
  promedio_categoria: OpcionPorcentaje[];
  preguntas: DatosEstadisticosPregunta[];
}

interface TablaProps {
  datos: DatosEstadisticosCategoria[];
  cant: number;
}

export default function TablaDatosEstadisticos({ datos, cant }: TablaProps) {
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
        {datos.map((categoria, i) => (
          <div key={i} className="mb-5 border rounded p-3 shadow-sm">
            <h4 className="text-primary mb-3">{categoria.categoria_cod} - {categoria.categoria_texto}</h4>

            <div className="mb-3">
              <h6 className="fw-bold">Promedio por categoría</h6>
              <table className="table table-bordered table-sm">
                <thead className="table-light">
                  <tr>
                    <th>Opción</th>
                    <th>Promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {categoria.promedio_categoria.map((op, idx) => (
                    <tr key={idx}>
                      <td>{op.opcion_id}</td>
                      <td>{op.porcentaje}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {categoria.preguntas && categoria.preguntas.length > 0 && (
              <div>
                <h6 className="fw-bold">Preguntas</h6>
                {categoria.preguntas.map((pregunta, j) => (
                  <div key={j} className="mb-3">
                    <p className="text-secondary mb-1">
                      <strong>{pregunta.id_pregunta}</strong>
                    </p>
                    <table className="table table-striped table-bordered table-sm">
                      <thead className="table-light">
                        <tr>
                          <th>Opción</th>
                          <th>Porcentaje</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pregunta.datos.map((opcion, k) => (
                          <tr key={k}>
                            <td>{opcion.opcion_id}</td>
                            <td>{opcion.porcentaje}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
