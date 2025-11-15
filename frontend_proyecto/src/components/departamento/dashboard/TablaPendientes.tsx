interface InformePendiente {
  materia: string;
  docente_responsable: string;
}

interface Props {
  pendientesData: InformePendiente[] | null;
}

export default function TablaPendientes({ pendientesData }: Props) {
  return (
    <div className="card shadow h-100">
      <div className="card-body p-4">
        <h5 className="card-title">Informes Pendientes</h5>
        {pendientesData && pendientesData.length > 0 ? (
          <table className="table table-striped table-sm">
            <thead>
              <tr>
                <th>Materia</th>
                <th>Docente Responsable</th>
              </tr>
            </thead>
            <tbody>
              {pendientesData.map((item, index) => (
                <tr key={index}>
                  <td>{item.materia}</td>
                  <td>{item.docente_responsable}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center text-muted p-4">
              <p className="mb-0">No hay informes pendientes.</p> 
            </div>
        )}
      </div>
    </div>
  );
};