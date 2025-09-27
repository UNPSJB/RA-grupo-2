export default function Menu() {
  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-50">
      {/* 
        d-flex: flexbox
        align-items-center: centrado vertical
        justify-content-center: centrado horizontal  
        min-vh-50: 50% de la altura de la vista
      */}
      <div className="text-center">
        <h1 className="display-4 fw-bold text-primary mb-3">Bienvenido</h1>
        {/* 
          display-4: tamaño de display grande
          fw-bold: texto en negrita
          text-primary: color primario de Bootstrap
        */}
      </div>
    </div>
  );
}