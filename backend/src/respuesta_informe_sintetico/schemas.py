from pydantic import BaseModel
from typing import Optional
from src.materias.schemas import Materia

class RespuestaInformeSinteticoBase(BaseModel):
    pregunta_id: int
    texto_respuesta: Optional[str] = None
    materia_id: Optional[int] = None
class RespuestaInformeSinteticoCreate(RespuestaInformeSinteticoBase):
    informe_completado_id: int
    
class RespuestaInformeSintetico(RespuestaInformeSinteticoBase):
    id: int
    informe_completado_id: int 
    materia: Optional[Materia] = None 
    class Config:
        from_attributes = True