from pydantic import BaseModel
from typing import Optional

class RespuestaInformeSinteticoBase(BaseModel):
    pregunta_id: int
    texto_respuesta: Optional[str] = None
    materia_id: Optional[int] = None
class RespuestaInformeSinteticoCreate(RespuestaInformeSinteticoBase):
    informe_completado_id: int
    
class RespuestaInformeSintetico(RespuestaInformeSinteticoBase):
    id: int
    informe_completado_id: int 

    class Config:
        from_attributes = True