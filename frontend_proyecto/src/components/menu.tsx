import React from 'react'; // Mantener React importado si usas JSX, aunque el error 6133 diga lo contrario, es buena práctica.
import { Link } from 'react-router-dom';

// 1. Definición de la Interfaz para las Propiedades de AccessCard
interface AccessCardProps {
  title: string;
  subtitle: string;
  iconClass: string;
  linkTo: string;
  iconBgColor: string;
}

// Componente Tarjeta de Acceso Rápido (usando la interfaz AccessCardProps)
function AccessCard({ title, subtitle, iconClass, linkTo, iconBgColor }: AccessCardProps) {
  return (
    <Link to={linkTo} className="col-lg-3 col-md-6 col-sm-12 text-decoration-none p-2">
      <div className="access-card card h-100">
        <div className="card-body text-center">
          <div className="access-icon-container" style={{ backgroundColor: iconBgColor }}>
            {/* Usamos iconos de Bootstrap Icons (bi-) */}
            <i className={`bi ${iconClass} access-icon`}></i>
          </div>
          <h5 className="card-title mt-3" style={{ color: 'var(--color-text-primary)' }}>
            {title}
          </h5>
          <p className="card-text text-muted">
            {subtitle}
          </p>
        </div>
      </div>
    </Link>
  );
}


export default function Menu() {
  // Colores de fondo de los iconos (ajustados a la marca)
  const iconColors = {
    estudiante: 'rgba(0, 94, 194, 0.15)', // Azul UNPSJB light
    docente: 'rgba(60, 157, 75, 0.15)',    // Verde Success light
    departamento: 'rgba(110, 44, 124, 0.15)', // Morado light
    secretaria: 'rgba(231, 88, 88, 0.15)',   // Rojo discreto light
  };

  return (
    <div className="container py-5">
      
      {/* 1. RECUADRO CENTRAL DE BIENVENIDA */}
      <div className="row justify-content-center mb-5">
        <div className="col-12 col-lg-10">
          <div className="welcome-box p-5 text-center"> 
            
            <div className="welcome-icon-large">
               {/* Icono de bienvenida grande (Birrete de graduación o similar) */}
               <i className="bi bi-mortarboard" style={{ color: 'var(--color-unpsjb-blue)' }}></i>
            </div>

            <h1 style={{ color: 'var(--color-text-primary)' }} className="display-4 fw-bold mt-3">
              ¡Bienvenido!
            </h1>
            <p className="lead" style={{ color: 'var(--color-text-primary)' }}>
              Al Sistema Integral de Gestión Académica de la Universidad Nacional <br/>de la Patagonia San Juan Bosco
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}