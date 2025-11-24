// src/types/auth.ts

// Equivalente a UserTypes.ts del otro proyecto
export interface User {
    id: number;
    username: string;
    email: string;
    role_name: string; // 'admin', 'docente', 'alumno', 'secretaria'
    role_id: number;
}

// Equivalente a partes de AuthTypes.ts
export interface LoginData {
    username: string;
    password: string;
}

// Definición del Contexto
export interface AuthContextType {
    currentUser: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (data: LoginData) => Promise<void>;
    logout: () => Promise<void>;
}