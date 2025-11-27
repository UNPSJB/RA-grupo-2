import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  // ELIMINA LOS HEADERS GLOBALES AQUÍ
  // headers: { 'Content-Type': 'application/json' }, <--- BORRA ESTO
  withCredentials: true,
});

export default api;