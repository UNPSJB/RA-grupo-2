import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ROUTES from '../../paths';

interface ProtectedRouteProps {
    allowedRoles: Array<string>; // Ej: ['admin', 'docente']
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { currentUser } = useAuth();
    
    // Obtenemos el rol del usuario (asegúrate que tu backend devuelva 'role_name')
    const userRole = currentUser?.role_name;

    // Lógica de seguridad:
    // 1. Si el usuario existe...
    // 2. Y NO es admin (el admin suele tener permiso a todo, si no quieres eso, quita esta condición)
    // 3. Y su rol NO está en la lista de permitidos...
    if (userRole && userRole !== 'admin' && !allowedRoles.includes(userRole)) {
        // ... Lo mandamos al Home/Menú porque no tiene permiso
        // También podrías crear una página de "No Autorizado" y mandarlo ahí.
        return <Navigate to={ROUTES.HOME} replace />;
    }

    // Si cumple los requisitos, mostramos el contenido
    return <Outlet />;
};