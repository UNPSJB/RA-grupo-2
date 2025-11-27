import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx' 
import { BrowserRouter } from "react-router-dom";
// 1. IMPORTAR EL PROVIDER
import { AuthProvider } from './context/AuthContext'; 

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      {/* 2. ENVOLVER LA APP AQUÍ */}
      <AuthProvider> 
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)