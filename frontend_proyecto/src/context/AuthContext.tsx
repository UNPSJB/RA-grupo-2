import React, { createContext, useCallback, useState, useEffect, useContext } from "react";
import { authService } from "../services/authService"; // Usamos el servicio que creamos antes
import type { AuthContextType, LoginData, User } from "../types/auth";

// 1. Definimos el valor por defecto del contexto
const defaultContextValue: AuthContextType = {
    currentUser: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    login: async () => {},
    logout: async () => {},
};

// 2. Creamos el Contexto
const AuthContext = createContext<AuthContextType>(defaultContextValue);

// 3. Exportamos el Hook personalizado (Esto reemplaza al archivo hooks/useAuth.ts del otro proyecto)
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
    return context;
};

// 4. El Proveedor que envolverá la App
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // A. Efecto de Carga Inicial (F5)
    // Al recargar la página, preguntamos al backend: "¿Sigo logueado?"
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const user = await authService.validateUser();
                setCurrentUser(user);
                setIsAuthenticated(true);
            } catch (error) {
                // Si falla (401/403), es que la cookie expiró o no existe
                setCurrentUser(null);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false); // Terminó la carga inicial
            }
        };
        checkAuth();
    }, []);

    // B. Función Login
    const login = useCallback(async (data: LoginData) => {
        setIsLoading(true);
        setError(null);
        try {
            await authService.login(data);
            
            // Validamos para obtener los datos completos
            const user = await authService.validateUser();
            
            setCurrentUser(user);
            setIsAuthenticated(true);
        } catch (err: any) {
            console.error("Error en login:", err);
            
            // --- MANEJO DE ERROR SEGURO ---
            let msg = "Error al iniciar sesión";

            if (err.response) {
                // Si es error 422 (Datos inválidos), FastAPI devuelve un array de detalles
                if (err.response.status === 422) {
                    msg = "Usuario o contraseña inválidos (Formato incorrecto)";
                } 
                // Si es 401 (Credenciales incorrectas)
                else if (err.response.status === 401) {
                    msg = "Usuario o contraseña incorrectos";
                }
                // Si el backend envía un mensaje 'detail' y ES UN STRING
                else if (err.response.data?.detail && typeof err.response.data.detail === 'string') {
                    msg = err.response.data.detail;
                }
            } else if (err.message) {
                // Error de red (servidor apagado, etc)
                msg = err.message;
            }

            setError(msg); // Ahora estamos seguros que 'msg' es un string
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // C. Función Logout
    const logout = useCallback(async () => {
        try {
            // 1. Avisamos al backend para borrar cookie
            await authService.logout();
        } catch (error) {
            console.error("Error al cerrar sesión en servidor", error);
        } finally {
            // 2. Limpiamos estado local pase lo que pase
            setCurrentUser(null);
            setIsAuthenticated(false);
            // 3. Forzamos redirección al login para limpiar caché visual
            window.location.href = "/login";
        }
    }, []);

    return (
        <AuthContext.Provider value={{ currentUser, isAuthenticated, isLoading, error, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};