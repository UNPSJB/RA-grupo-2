// src/components/departamento/InformeSinteticoDetalle.tsx

// ⬅️ Reutilizamos el componente de detalle de Secretaría
import InformeSinteticoDetail from "../../informeSintetico/informesSinteticosCompletados/InformeSinteticoDetail"; 

// Si necesitas que la URL de "Volver" sea diferente (ej: volver a la lista del departamento),
// puedes envolverlo y pasar una prop para cambiar el comportamiento, pero si el 
// router maneja las rutas de forma correcta, esto no debería ser necesario.
export default InformeSinteticoDetail;