import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../navbar/navbar"; 
import Footer from "../footer/footer";
import ROUTES from "../../paths";
// 1. IMPORTAR EL COMPONENTE
import FloatingMenu from "../common/FloatingMenu";

const AuthLayout = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to={ROUTES.LOGIN} replace />;
    }

    return (
        <div className="d-flex flex-column min-vh-100">
            <Navbar />
            
            <main className="flex-grow-1" style={{ paddingTop: '101px' }}>
                <div className="container-fluid px-2">
                    <Outlet />
                </div>
            </main>

            <Footer />

            {/* 2. AQUÍ COLOCAMOS EL MENÚ FLOTANTE */}
            <FloatingMenu />
        </div>
    );
};

export default AuthLayout;