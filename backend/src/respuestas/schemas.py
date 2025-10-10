from pydantic import BaseModel, Field
from typing import Optional
class RespuestaBase(BaseModel):
    pregunta_id: int
    opcion_id: Optional[int] = None
    texto_respuesta: Optional[str] = Field(default=None, max_length=150)

class RespuestaCreate(RespuestaBase):
    encuesta_completada_id: int
    
class Respuesta(RespuestaBase):
    id: int
    encuesta_completada_id: int

model_config = {"from_attributes": True}

class RespuestaCreateEnEncuesta(RespuestaBase):
    pass