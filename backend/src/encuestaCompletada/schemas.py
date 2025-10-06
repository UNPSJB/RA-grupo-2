from pydantic import BaseModel
from datetime import datetime
from typing import List
from src.respuestas.schemas import Respuesta, RespuestaCreate
from src.asociaciones.models import Periodo

class EncuestaCompletadaBase(BaseModel):
    alumno_id: int
    encuesta_id: int
    materia_id: int
    anio: int
    periodo: Periodo

class EncuestaCompletadaCreate(EncuestaCompletadaBase):
    pass

class EncuestaCompletadaConRespuestasCreate(EncuestaCompletadaBase):
    respuestas: List[RespuestaCreate]

class EncuestaCompletada(EncuestaCompletadaBase):
    id: int
    #fecha_completada: datetime
    respuestas: List[Respuesta]

    model_config = {"from_attributes": True}

