interface Carrera {
  id: number;
  nombre: string;
}

interface Props {
  anio: number | null;
  periodo: string | null;
  carreraId: number | null;
  aniosList: number[];
  periodosList: string[];
  carrerasList: Carrera[];
  onAnioChange: (value: number) => void;
  onPeriodoChange: (value: string) => void;
  onCarreraChange: (value: number | null) => void;
}

export default function FiltrosDashboard({
  anio,
  periodo,
  carreraId,
  aniosList,
  periodosList,
  carrerasList,
  onAnioChange,
  onPeriodoChange,
  onCarreraChange
}: Props) {
  return (
    <div className="row g-3 mb-4">
      <div className="col-md-4">
        <label htmlFor="anio" className="form-label">Año</label>
        <select 
          id="anio" 
          className="form-select" 
          value={anio ?? ''} 
          onChange={(e) => onAnioChange(Number(e.target.value))}
        >
          {aniosList.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      <div className="col-md-4">
        <label htmlFor="periodo" className="form-label">Ciclo</label>
        <select 
          id="periodo" 
          className="form-select" 
          value={periodo ?? ''} 
          onChange={(e) => onPeriodoChange(e.target.value)}
        >
          {periodosList.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div className="col-md-4">
         <label htmlFor="carrera" className="form-label">Carrera</label>
         <select 
          id="carrera" 
          className="form-select" 
          value={carreraId ?? ''} 
          onChange={(e) => onCarreraChange(Number(e.target.value) || null)}
         >
          <option value="">Todo el Departamento</option>
          {carrerasList.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>
    </div>
  );
};