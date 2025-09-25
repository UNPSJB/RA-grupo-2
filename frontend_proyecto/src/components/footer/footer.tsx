export default function Footer() {
  return (
    <footer className="bg-primary text-light py-4 mt-auto">
      {/* 
        bg-dark: Fondo oscuro
        text-light: Texto claro
        py-4: Padding vertical
        mt-auto: Empuja el footer hacia abajo
      */}
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <p className="mb-0">Universidad Nacional de la Patagonia San Juan Bosco (UNPSJB) </p>
          </div>
          <div className="col-md-6 text-md-end">
            <p className="mb-0">
              © 2025 Todos los derechos reservados
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}