import { Link } from "react-router-dom";

const Icons = {
  Document: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
      <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/>
      <path d="M3 5.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 8zm0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
    </svg>
  ),
  Form: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
      <path d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm5.5 1.5v2a1 1 0 0 0 1 1h2l-3-3z"/>
      <path d="M4.5 12a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
    </svg>
  ),
  Calendar: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
      <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
    </svg>
  ),
  Chart: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
      <path d="M0 0h1v15h15v1H0V0zm10 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zm-5 3a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 1 .5-.5zm10-6a.5.5 0 0 1 .5.5v10a.5.5 0 0 1-1 0v-10a.5.5 0 0 1 .5-.5z"/>
    </svg>
  ),
  Checklist: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
      <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/>
      <path d="M7 5.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0zM7 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 0 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0z"/>
    </svg>
  )
};

const getIcon = (title: string) => {
  const t = title.toLowerCase();
  
  if (t.includes("encuesta") || t.includes("asignar")) return <Icons.Checklist />;
  
  if (
      t.includes("informe") || 
      t.includes("inf.") ||
      t.includes("sintetico") || 
      t.includes("sintético") || 
      t.includes("catedra")
  ) {
      return <Icons.Document />;
  }
  
  if (t.includes("fecha") || t.includes("definir")) return <Icons.Calendar />;

  if (
    t.includes("grafico") ||
    t.includes("gráfico") ||
    t.includes("graficos") ||
    t.includes("gráficos") ||
    t.includes("estadistic")
  ) {
    return <Icons.Chart />;
  }
  
  return <Icons.Form />;
};

export const ActionCard = ({ title, to, index }: { title: string, to: string, index: number }) => (
  <Link to={to} className="text-decoration-none h-100">
    <div 
      className="card-modern h-100 p-4 d-flex flex-row align-items-center gap-4 animate-fade-up position-relative overflow-hidden"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div 
        className="d-flex align-items-center justify-content-center rounded-4 shadow-sm"
        style={{ 
          minWidth: '64px', 
          height: '64px', 
          background: 'var(--gradient-primary)',
          color: 'white',
          position: 'relative', zIndex: 1
        }}
      >
        {getIcon(title)}
      </div>
      
      <div className="flex-grow-1" style={{ position: 'relative', zIndex: 1 }}>
        <h5 className="fw-bold mb-1" style={{ fontSize: '1.05rem', color: 'var(--color-text-primary)' }}>
          {title}
        </h5>
        <div className="d-flex align-items-center small fw-medium" style={{ color: 'var(--color-brand-primary)' }}>
          <span>Acceder ahora</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="ms-1" viewBox="0 0 16 16" style={{transition: 'transform 0.2s'}} >
            <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
          </svg>
        </div>
      </div>

      <div style={{
        position: 'absolute',
        right: -20,
        bottom: -20,
        width: '100px',
        height: '100px',
        background: 'var(--color-brand-light)',
        borderRadius: '50%',
        opacity: 0.5,
        zIndex: 0, 
        pointerEvents: 'none'
      }} />
    </div>
  </Link>
);