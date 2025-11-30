interface InformePendiente {
  materia: string;
  docente_responsable: string;
}

interface Props {
  pendientesData: InformePendiente[] | null;
}

export default function TablaPendientes({ pendientesData }: Props) {
  if (!pendientesData || pendientesData.length === 0) {
      return (
        <div className="text-center text-muted py-5">
            <p className="mb-0">No hay informes pendientes.</p>
        </div>
      );
  }

  return (
    <div className="table-responsive">
      <table className="table align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th className="border-0 text-secondary fw-semibold ps-3" style={{fontSize: '0.85rem'}}>MATERIA</th>
            <th className="border-0 text-secondary fw-semibold" style={{fontSize: '0.85rem'}}>DOCENTE</th>
          </tr>
        </thead>
        <tbody>
          {pendientesData.map((item, index) => (
            <tr key={index} style={{cursor: 'default'}}> 
              <td className="ps-3 text-dark fw-medium" style={{fontSize: '0.9rem'}}>
                  {item.materia}
              </td>

              <td className="text-secondary" style={{fontSize: '0.85rem'}}>
                  {item.docente_responsable}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};