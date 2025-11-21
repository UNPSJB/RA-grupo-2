import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import ROUTES from '../../paths';

interface LoginCardProps {
  isDarkMode: boolean;
}

const LoginCard: React.FC<LoginCardProps> = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="card glass-card overflow-hidden border-0" style={{ width: '100%', maxWidth: '950px' }}>
      <div className="row g-0">
        
        <div className={`col-md-5 d-none d-md-flex flex-column justify-content-between p-5 info-panel`}>
          <div>
            <div className="mb-4">
              <div className={`rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm ${isDarkMode ? 'bg-white text-primary' : 'bg-primary text-white'}`} style={{ width: '48px', height: '48px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5l2.404.961L10.404 2l-2.218-.887zm3.564 1.426L5.596 5 8 5.961 14.154 3.5l-2.404-.961zm3.25 1.7-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z"/>
                </svg>
              </div>
            </div>
            
            <h1 className="fw-bold display-6 mb-2">Bienvenido</h1>
            <h4 className={`h6 mb-4 ${isDarkMode ? 'opacity-75' : 'text-muted'}`}>Sistema de Encuestas</h4>
            <p className={`small ${isDarkMode ? 'opacity-75' : 'text-secondary'}`} style={{ lineHeight: '1.6' }}>
              Accede a la plataforma institucional para gestionar y participar en los procesos de evaluación académica.
            </p>
          </div>

          <div className="mt-4">
            <p className={`small fw-bold mb-2 text-uppercase ls-1 ${isDarkMode ? 'opacity-50' : 'text-muted opacity-75'}`}>Síguenos</p>
            <div className={`d-flex gap-3 ${isDarkMode ? 'opacity-75' : 'text-secondary'}`}>
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-facebook cursor-pointer" viewBox="0 0 16 16"><path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/></svg>
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-twitter-x cursor-pointer" viewBox="0 0 16 16"><path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z"/></svg>
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-instagram cursor-pointer" viewBox="0 0 16 16"><path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.917 3.917 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.232-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.231 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/></svg>
            </div>
          </div>
        </div>

        <div className="col-md-7 p-5 form-panel">
          <div className="h-100 d-flex flex-column justify-content-center">
            <div className="mb-4">
              <h3 className={`fw-bold ${isDarkMode ? 'text-white' : 'text-dark'}`}>Iniciar Sesión</h3>
              <p className={`small mb-0 ${isDarkMode ? 'text-light opacity-50' : 'text-secondary opacity-75'}`}>
                Ingresa tus credenciales para continuar
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="username" className={`form-label small fw-bold ${isDarkMode ? 'text-light opacity-75' : 'text-secondary'}`}>Usuario</label>
                <div className="custom-input-group">
                  <div className="input-icon-wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-person-fill" viewBox="0 0 16 16">
                      <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
                    </svg>
                  </div>
                  <input 
                    type="text" 
                    className="glass-input" 
                    id="username" 
                    placeholder="Nombre de usuario" 
                    required 
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="password" className={`form-label small fw-bold ${isDarkMode ? 'text-light opacity-75' : 'text-secondary'}`}>Contraseña</label>
                <div className="custom-input-group">
                  <div className="input-icon-wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-lock-fill" viewBox="0 0 16 16">
                      <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                    </svg>
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="glass-input" 
                    id="password" 
                    placeholder="Contraseña" 
                    required 
                  />
                  <button 
                    type="button"
                    className="password-toggle-btn"
                    onClick={togglePassword}
                    title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-eye-slash-fill" viewBox="0 0 16 16">
                        <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z"/>
                        <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12-.708.708z"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-eye-fill" viewBox="0 0 16 16">
                        <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                        <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="form-check">
                  <input type="checkbox" className="form-check-input" id="remember" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)', backgroundColor: 'transparent' }} />
                  <label className={`form-check-label small ${isDarkMode ? 'text-light opacity-75' : 'text-secondary'}`} htmlFor="remember">Recordarme</label>
                </div>
                <a href="#" className={`text-decoration-none small fw-bold ${isDarkMode ? 'text-info' : 'text-primary'}`}>
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <div className="d-grid">
                <button type="submit" className="btn btn-primary py-2 fw-bold shadow-sm border-0" onClick={() => navigate(ROUTES.HOME)} style={{ background: isDarkMode ? '#3b82f6' : '#2563eb' }}>
                  Ingresar al Sistema
                </button>
              </div>
            </form>

            <div className="mt-5 text-center">
              <p className={`small mb-0 ${isDarkMode ? 'text-light opacity-25' : 'text-muted opacity-50'}`} style={{ fontSize: '0.75rem' }}>
                © 2025 Universidad Nacional
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginCard;