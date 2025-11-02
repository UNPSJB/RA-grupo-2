from pydantic import BaseModel
from datetime import date
from typing import List
from src.respuesta_informe_sintetico.schemas import RespuestaInformeSintetico
from src.respuesta_informe_sintetico import schemas as respuestas_schemas
class InformeSinteticoCompletadoBase(BaseModel):
    titulo: str
    contenido: str
    fecha: date

    informe_base_id: int 

class InformeSinteticoCompletadoCreate(InformeSinteticoCompletadoBase):
    respuestas: List[respuestas_schemas.RespuestaInformeSinteticoBase]
    
class InformeSinteticoCompletado(InformeSinteticoCompletadoBase):
    id: int
    respuestas: List[RespuestaInformeSintetico]

    class Config:
        from_attributes = True