import api from "./api";
import type { LoginData, User } from "../types/auth";

export const authService = {
    login: async (data: LoginData) => {
        const params = new URLSearchParams();
        params.append("username", data.username);
        params.append("password", data.password);
        
        // Recordatorio: Usamos el header correcto para FastAPI
        const response = await api.post("/auth/token", params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return response.data; 
    },

    // --- CORRECCIÓN AQUÍ ---
    logout: async () => {
        // Antes tenías: await api.post("/auth/logout");
        // Cambiamos a DELETE sobre /auth/token que es lo estándar en tu backend
        await api.delete("/auth/token"); 
    },
    // -----------------------

    validateUser: async (): Promise<User> => {
        const response = await api.get("/auth/validate-user");
        return response.data;
    }
};