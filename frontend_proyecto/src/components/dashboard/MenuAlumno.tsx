import { useStudentData } from "../../hooks/useStudentData"; 
import { getRoleLinks } from "../../config/navigationParams";
import { ActionCard } from "./ActionCard";

const Icons = {
  Calendar: () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16"><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/></svg>,
  Checklist: () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16"><path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/><path d="M7 5.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0zM7 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 0 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0z"/></svg>,
  Time: () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16"><path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/></svg>,
  Alert: () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>,
  Lock: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/></svg>
};

const decorationStyle: React.CSSProperties = {
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
};

const getPeriodState = (inicio: Date | null, fin: Date | null) => {
    if (!inicio || !fin) return { type: 'UNDEFINED', days: 0 };
    
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    const fechaInicio = new Date(inicio); fechaInicio.setHours(0,0,0,0);
    const fechaFin = new Date(fin); fechaFin.setHours(0,0,0,0);

    if (hoy < fechaInicio) {
        const diffTime = fechaInicio.getTime() - hoy.getTime();
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (days <= 7) return { type: 'COMING_SOON', days };
        return { type: 'FUTURE', days };
    }
    
    if (hoy >= fechaInicio && hoy <= fechaFin) {
        const diffTime = fechaFin.getTime() - hoy.getTime();
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (days <= 3) return { type: 'CLOSING_SOON', days };
        return { type: 'OPEN', days };
    }

    return { type: 'CLOSED', days: 0 };
};

const PeriodSection = ({ inicio, fin }: { inicio: Date | null, fin: Date | null }) => {
    const { type, days } = getPeriodState(inicio, fin);

    let config = {
        title: "Cargando...",
        desc: "Obteniendo información...",
        colorClass: "text-muted",
        bgColor: "bg-light text-secondary",
        icon: <Icons.Calendar />,
        counterLabel: "-",
        counterColor: "#6c757d",
        borderColor: "transparent"
    };

    switch (type) {
        case 'FUTURE':
            config = {
                title: "Próxima Apertura",
                desc: `Habilitado desde el ${inicio?.toLocaleDateString()}`,
                colorClass: "text-primary",
                bgColor: "bg-primary-subtle text-primary",
                icon: <Icons.Time />,
                counterLabel: "Días para abrir",
                counterColor: "var(--color-brand-primary)",
                borderColor: "var(--color-brand-light)"
            };
            break;
        case 'COMING_SOON':
            config = {
                title: "Apertura Inminente",
                desc: `Prepárate, inicia el ${inicio?.toLocaleDateString()}`,
                colorClass: "text-warning",
                bgColor: "bg-warning-subtle text-warning-emphasis",
                icon: <Icons.Time />,
                counterLabel: "Días para abrir",
                counterColor: "#eab308",
                borderColor: "#fef08a"
            };
            break;
        case 'OPEN':
            config = {
                title: "Periodo de Encuestas Abierto",
                desc: `Cierre: ${fin?.toLocaleDateString()}`,
                colorClass: "text-success",
                bgColor: "bg-success-subtle text-success",
                icon: <Icons.Checklist />,
                counterLabel: "Días restantes",
                counterColor: "var(--color-success)",
                borderColor: "#bbf7d0"
            };
            break;
        case 'CLOSING_SOON':
            config = {
                title: "Cierre Inminente",
                desc: `¡Atención! Cierra el ${fin?.toLocaleDateString()}`,
                colorClass: "text-danger",
                bgColor: "bg-danger-subtle text-danger",
                icon: <Icons.Alert />,
                counterLabel: "Días restantes",
                counterColor: "var(--color-danger)",
                borderColor: "#fecaca"
            };
            break;
        case 'CLOSED':
            config = {
                title: "Periodo Cerrado",
                desc: `Finalizó el ${fin?.toLocaleDateString()}`,
                colorClass: "text-danger",
                bgColor: "bg-danger-subtle text-danger",
                icon: <Icons.Calendar />,
                counterLabel: "Finalizado",
                counterColor: "var(--color-danger)",
                borderColor: "#fecaca"
            };
            break;
        case 'UNDEFINED':
            config = {
                title: "Periodo no definido",
                desc: "Las fechas no han sido asignadas.",
                colorClass: "text-secondary",
                bgColor: "bg-light text-secondary",
                icon: <Icons.Calendar />,
                counterLabel: "Sin fecha",
                counterColor: "#6c757d",
                borderColor: "#e9ecef"
            };
            break;
        default:
             break;
    }

    const titleStyle = type === 'COMING_SOON' ? { color: '#ca8a04' } : {}; 

    return (
        <div className="row g-3">
            <div className="col-md-8 col-xl-9">
                <div className="card-modern p-4 h-100 d-flex flex-row align-items-center gap-4 animate-fade-up position-relative overflow-hidden">
                    <div 
                        className={`d-flex align-items-center justify-content-center rounded-4 shadow-sm ${config.bgColor}`}
                        style={{ minWidth: '56px', height: '56px', position: 'relative', zIndex: 1 }}
                    >
                        {config.icon}
                    </div>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <h5 className={`fw-bold mb-1 ${config.colorClass}`} style={titleStyle}>{config.title}</h5>
                        <div className="small fw-medium text-muted">{config.desc}</div>
                    </div>
                    <div style={decorationStyle} />
                </div>
            </div>

            <div className="col-md-4 col-xl-3">
                <div 
                    className="card-modern h-100 d-flex flex-column align-items-center justify-content-center animate-fade-up position-relative overflow-hidden"
                    style={{ 
                        border: `2px solid ${config.borderColor}`,
                        background: type === 'UNDEFINED' ? '#f8f9fa' : 'white'
                    }}
                >
                   {type === 'CLOSED' || type === 'UNDEFINED' ? (
                       <div className="text-center p-3">
                           <h3 className="fw-bold mb-0" style={{ color: config.counterColor }}>
                               {type === 'CLOSED' ? "X" : "—"}
                           </h3>
                           <small className="text-muted fw-bold" style={{fontSize: '0.7rem'}}>
                               {config.counterLabel}
                           </small>
                       </div>
                   ) : (
                       <div className="text-center p-2">
                           <span className="fw-bold" style={{ color: config.counterColor, lineHeight: 1, fontSize: '2.5rem' }}>
                               {days}
                           </span>
                           <div className="text-muted fw-bold text-uppercase mt-1" style={{fontSize: '0.65rem', letterSpacing: '1px'}}>
                               {config.counterLabel}
                           </div>
                       </div>
                   )}
                </div>
            </div>
        </div>
    );
}

const ProgressCard = ({ completadas, total, porcentaje, periodDefined }: { completadas: number, total: number, porcentaje: number, periodDefined: boolean }) => {
  const pendientes = total - completadas;
  const colorCompleted = "var(--color-brand-primary)";
  const colorPending = "#e2e8f0";  
  const colorDisabled = "#e9ecef";
  const colorTextDisabled = "#adb5bd";
  const hasData = periodDefined && total > 0;
  const isWaiting = periodDefined && total === 0;

  return (
    <div className="card-modern h-100 p-4 d-flex flex-column animate-fade-up position-relative overflow-hidden">
      
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="mb-4 text-start">
          <h5 className="fw-bold mb-1 text-dark">Tu Progreso</h5>
          <p className="text-muted small mb-0">
             {!periodDefined 
                ? "Información no disponible." 
                : (hasData ? "Estado actual de tus obligaciones." : "No tienes encuestas asignadas.")}
          </p>
        </div>
        
        <div className="d-flex justify-content-center mb-4 flex-grow-1 align-items-center">
          <div className="position-relative" style={{ width: '160px', height: '160px' }}>
              <svg width="160" height="160" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke={hasData ? colorPending : colorDisabled} strokeWidth="12" />
                  {hasData && (
                      <circle 
                          cx="60" cy="60" r="54" 
                          fill="none" 
                          stroke={colorCompleted}
                          strokeWidth="12" 
                          strokeDasharray="339.292" 
                          strokeDashoffset={339.292 - (339.292 * porcentaje) / 100}
                          strokeLinecap="round"
                          transform="rotate(-90 60 60)"
                          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                      />
                  )}
              </svg>
              
              <div className="position-absolute top-50 start-50 translate-middle d-flex flex-column align-items-center">
                  {!periodDefined ? (
                      <div className="text-muted"><Icons.Lock /></div>
                  ) : (
                      <>
                        <span className="fw-bold text-dark" style={{ fontSize: '2.2rem', color: hasData ? 'inherit' : colorTextDisabled }}>
                            {hasData ? `${porcentaje}%` : "—"}
                        </span>
                        <span className="fw-bold" style={{fontSize: '0.6rem', letterSpacing: '1px', color: hasData ? '#6c757d' : colorTextDisabled }}>
                            {hasData ? "COMPLETADO" : "SIN DATOS"}
                        </span>
                      </>
                  )}
              </div>
          </div>
        </div>

        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center gap-2">
                  <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: hasData ? colorCompleted : colorDisabled }}></span>
                  <span className="text-muted small fw-medium">Completadas</span>
              </div>
              <span className={`fw-bold ${hasData ? 'text-dark' : 'text-muted'}`}>
                  {hasData ? completadas : "-"}
              </span>
          </div>
          <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                  <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: hasData ? colorPending : colorDisabled }}></span>
                  <span className="text-muted small fw-medium">Pendientes</span>
              </div>
              <span className={`fw-bold ${hasData ? 'text-dark' : 'text-muted'}`}>
                  {hasData ? pendientes : "-"}
              </span>
          </div>
        </div>
      </div>

      <div style={decorationStyle} />
    </div>
  );
}

export default function MenuAlumno() {
    const links = getRoleLinks('alumno');
    const { fechas, progreso } = useStudentData();
    const periodDefined = !!(fechas.inicio && fechas.fin);

    return (
        <div className="row g-4">
            <div className="col-lg-8 d-flex flex-column gap-4">
                <PeriodSection inicio={fechas.inicio} fin={fechas.fin} />
                
                <div className="row g-4">
                    {links.map((link, index) => (
                        <div key={index} className="col-12 col-md-6">
                            <ActionCard {...link} index={index + 1} />
                        </div>
                    ))}
                </div>
            </div>

            <div className="col-lg-4">
                <ProgressCard 
                    completadas={progreso.completadas} 
                    total={progreso.total} 
                    porcentaje={progreso.porcentaje}
                    periodDefined={periodDefined} 
                />
            </div>
        </div>
    );
}