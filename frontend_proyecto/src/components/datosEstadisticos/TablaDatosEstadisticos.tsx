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
}

export default function TablaDatosEstadisticos({ datos }: TablaProps) {
  return (
    <div className="card mt-4">
      <div className="card-header bg-secondary text-white">
        <h2 className="h5 mb-0">
            "Datos Estadísticos"
        </h2>
      </div>

      <div className="card-body">
        <table className="table table-striped table-bordered">
          <thead className="table-primary">
            <tr>
              <th>Pregunta</th>
              <th>Opción</th>
              <th>Porcentaje</th>
            </tr>
          </thead>
          <tbody>
            {datos.map((pregunta, i) =>
              pregunta.datos.map((opcion, j) => (
                <tr key={`${i}-${j}`}>
                  <td>{pregunta.id_pregunta}</td>
                  <td>{opcion.opcion_id}</td>
                  <td>{opcion.porcentaje}%</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
