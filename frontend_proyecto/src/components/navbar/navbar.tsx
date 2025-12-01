import { Link } from "react-router-dom";
import ROUTES from "../../paths";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";

const DEFAULT_LOCATION = {
  lat: -43.249, 
  lon: -65.305,
  name: "Trelew" 
};

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [weather, setWeather] = useState<{ temp: number; code: number; city: string } | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  const role = currentUser?.role_name;
  const userName = currentUser?.username || "Usuario";
  const userRoleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : "Invitado";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchInfo = async (lat: number, lon: number, accuracy?: number) => {
      try {
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
        );
        const weatherData = await weatherRes.json();

        let cityName = "";
        try {
          const cityRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=es`
          );
          const cityData = await cityRes.json();
          cityName = cityData.locality || cityData.city || cityData.principalSubdivision || DEFAULT_LOCATION.name;
          cityName = cityName
            .replace("Ciudad de ", "")
            .replace("Municipalidad de ", "")
            .replace("Departamento de ", "");
        } catch (e) {
          cityName = "Tu ubicación";
        }

        if (weatherData.current_weather) {
          setWeather({
            temp: Math.round(weatherData.current_weather.temperature),
            code: weatherData.current_weather.weathercode,
            city: cityName,
          });
        }
      } catch (error) {
        console.error("Error en API clima:", error);
      } finally {
        setLoadingWeather(false);
      }
    };

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchInfo(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy),
        (err) => fetchInfo(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon),
        geoOptions
      );
    } else {
      fetchInfo(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon);
    }
  }, []);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
  };

  const getWeatherIcon = (code: number) => {
    if (code === 0) return (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#fbbf24" viewBox="0 0 16 16"><path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/></svg>);
    if (code > 0 && code <= 3) return (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#9ca3af" viewBox="0 0 16 16"><path d="M13.405 7.027a5.001 5.001 0 0 0-9.499-1.004A3.5 3.5 0 1 0 3.5 13H13a3 3 0 0 0 .405-5.973z"/></svg>);
    return (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#60a5fa" viewBox="0 0 16 16"><path d="M4.158 12.025a.5.5 0 0 1 .316.632l-.5 1.5a.5.5 0 0 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.316zm6 0a.5.5 0 0 1 .316.632l-.5 1.5a.5.5 0 0 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.316zm-3.5 1.5a.5.5 0 0 1 .316.632l-.5 1.5a.5.5 0 0 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.316zm3.5 0a.5.5 0 0 1 .316.632l-.5 1.5a.5.5 0 0 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.316zm.5-6.5a4.5 4.5 0 0 1 4.473 4h.027a2.5 2.5 0 0 1 0 5H3a3 3 0 0 1-.247-5.99A4.502 4.502 0 0 1 10.5 7z"/></svg>);
  };

  return (
    <nav
      className={`navbar fixed-top transition-all duration-300`}
      style={{
        padding: scrolled ? '0.75rem 1.5rem' : '1.25rem 2rem',
        transition: 'all 0.4s ease',
        zIndex: 1040,
      }}
    >
      <div 
        className="container-fluid glass-panel rounded-4 px-4 py-2 d-flex justify-content-between align-items-center position-relative"
        style={{
          boxShadow: scrolled ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
          background: 'var(--color-surface-glass)', 
        }}
      >
        {/* BRANDING */}
        <Link className="navbar-brand d-flex align-items-center gap-3" to={ROUTES.HOME}>
          <div className="position-relative d-flex align-items-center">
            <div 
              className="position-absolute top-50 start-50 translate-middle"
              style={{
                width: '50px', 
                height: '50px',
                background: 'var(--color-brand-primary)',
                filter: 'blur(30px)',
                opacity: 0.20,
                zIndex: -1,
                borderRadius: '50%'
              }}
            />
            <img 
              src="/unpsjb-logo.png" 
              alt="Logo UNPSJB" 
              style={{ 
                height: '45px', 
                objectFit: 'contain',
                position: 'relative'
              }} 
            />
          </div>
          <div className="d-flex flex-column lh-1">
            <span className="fw-bold text-gradient" style={{ fontSize: '1.2rem', letterSpacing: '-0.5px' }}>
              Sistema de Encuestas
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 500, letterSpacing: '0.5px' }}>
              Universidad Nacional de la Patagonia San Juan Bosco
            </span>
          </div>
        </Link>

        <div className="navbar-nav ms-auto d-flex flex-row align-items-center gap-3">
          
          {/* WIDGET CLIMA*/}
          {!loadingWeather && weather && (
            <div 
              className="d-none d-lg-flex align-items-center gap-2 py-1 fade-in"
              style={{
                fontSize: '0.9rem',
                color: 'var(--color-text-secondary)'
              }}
              title={`Clima actual en ${weather.city}`}
            >
               {getWeatherIcon(weather.code)}
               <span className="fw-bold" style={{ color: 'var(--color-text-primary)' }}>
                 {weather.temp}°C
               </span>
               <span 
                 className="small text-truncate" 
                 style={{ fontSize: '0.75rem', maxWidth: '100px', color: 'var(--color-text-secondary)' }}
               >
                 {weather.city}
               </span>
            </div>
          )}

          {/* USER CAPSULE */}
          <li className="nav-item dropdown position-relative list-unstyled">
             <a
              className="nav-link d-flex align-items-center gap-3 ps-1 pe-3 py-1 rounded-pill" 
              href="#"
              id="userDropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ 
                background: 'var(--color-surface)', 
                border: '1px solid var(--color-border)',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-brand-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
            >
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center text-white shadow-sm"
                style={{ 
                  width: '38px',
                  height: '38px',
                  background: 'var(--gradient-primary)',
                  fontSize: '0.9rem'
                }}
              >
                {userName.charAt(0).toUpperCase()}
              </div>
              
              <div className="d-none d-md-flex flex-column align-items-start">
                <span className="fw-bold" style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                  {userName}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-brand-primary)' }}>
                  {userRoleLabel}
                </span>
              </div>
              
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="ms-2" viewBox="0 0 16 16" style={{ color: 'var(--color-text-secondary)' }}>
                <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
              </svg>
            </a>

            {/* DROPDOWN MENU */}
            <ul 
              className="dropdown-menu dropdown-menu-end mt-3 border-0 shadow-lg p-0 rounded-4 overflow-hidden" 
              aria-labelledby="userDropdown"
              style={{ 
                minWidth: '240px',
                background: 'var(--color-surface)',
                border: 'var(--glass-border)',
                position: 'absolute',
                right: 0
              }}
            >
              <li>
                <a 
                  className="dropdown-item px-3 py-2 d-flex align-items-center gap-2 text-danger fw-medium"
                  href="#" 
                  onClick={handleLogout}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                     <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
                  </svg>
                  Cerrar Sesión
                </a>
              </li>
            </ul>
          </li>
        </div>
      </div>
    </nav>
  );
}