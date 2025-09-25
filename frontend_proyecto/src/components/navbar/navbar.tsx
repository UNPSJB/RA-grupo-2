
export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
      {/* 
        fixed-top: Navbar FIJO en la parte superior (clase de Bootstrap)
        bg-primary: Color azul de Bootstrap (puedes cambiar por otro)
      */}
      <div className="container-fluid">
        <a className="navbar-brand fw-bold" href="/">
          Sistema de encuestas
        </a>
        
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
            <a className="nav-link" href="/encuestas">Encuestas</a>
            <a className="nav-link" href="/docentes/1">Docentes</a>
            <a className="nav-link" href="/departamento">Carreras</a>
            <a className="nav-link" href="/informes">Informes Sintéticos</a>
          </div>
        </div>
      </div>
    </nav>
  );
}