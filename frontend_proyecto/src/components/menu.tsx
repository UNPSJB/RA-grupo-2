export default function Menu() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center mb-5">
        <div className="col-12 col-lg-10">
          <div className="welcome-box p-5 text-center"> 
            
            <div className="welcome-icon-large">
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