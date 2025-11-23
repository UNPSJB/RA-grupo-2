import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../navbar/navbar"; // Ajusta la ruta si tu navbar está en otro lado
import Footer from "../footer/footer"; // Ajusta la ruta si tu footer está en otro lado
import ROUTES from "../../paths";

const AuthLayout = () => {
    const { isAuthenticated, isLoading } = useAuth();

    // 1. Mientras verificamos la cookie (validateUser), mostramos un spinner
    // Esto evita que la app "parpadee" y te mande al login por error
    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    // 2. Si terminó de cargar y NO está autenticado -> Al Login
    if (!isAuthenticated) {
        return <Navigate to={ROUTES.LOGIN} replace />;
    }

    // 3. Si está autenticado -> Renderizamos la App completa
    // Aquí integramos el Navbar y Footer para no repetirlos en cada página
    return (
        <div className="d-flex flex-column min-vh-100">
            <Navbar />
            
            <main className="flex-grow-1" style={{ paddingTop: '101px' }}>
                <div className="container-fluid px-2">
                    {/* <Outlet /> es donde se renderizarán las rutas hijas (Menú, Encuestas, etc.) */}
                    <Outlet />
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AuthLayout;