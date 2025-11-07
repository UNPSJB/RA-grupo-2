from pydantic import BaseModel
from typing import List, Optional
from src.informe_sintetico_completado.schemas import InformeSinteticoCompletado 
from src.pregunta_informe_sintetico.schemas import PreguntaInformeSintetico

class InformeSinteticoBaseBase(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    carrera_id: Optional[int] = None

class InformeSinteticoBaseCreate(InformeSinteticoBaseBase):
    pass 

class InformeSinteticoBase(InformeSinteticoBaseBase):
    id: int
    #informes_completados: List[InformeSinteticoCompletado] = []
    preguntas: List[PreguntaInformeSintetico] = []

    class Config:
        from_attributes = True