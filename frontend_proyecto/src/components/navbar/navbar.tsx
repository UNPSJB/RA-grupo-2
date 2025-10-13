import { Link } from "react-router-dom";
export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
      {/* 
        fixed-top: Navbar FIJO en la parte superior (clase de Bootstrap)
        bg-primary: Color azul de Bootstrap (puedes cambiar por otro)
      */}
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/">
          Sistema de encuestas
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarContent"
          aria-controls="navbarContent" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarContent">
          <div className="navbar-nav">
            <Link className="nav-link" to="/encuestas">Encuestas</Link>
            <Link className="nav-link" to="/docentes/1">Docentes</Link>
            <Link className="nav-link" to="/departamento">Carreras</Link>
            <Link className="nav-link" to="/informes">Informes Sintéticos</Link>
            <Link className="nav-link" to="/preguntas/crear">Crear Pregunta</Link>
            <Link className="nav-link" to="/encuestas-completadas">Encuestas Completadas</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}