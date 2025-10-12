# src/encuestas/schemas.py (fragmento)
from pydantic import BaseModel

class EncuestaBase(BaseModel):
    nombre: str

class Encuesta(EncuestaBase):
    id: int
    nombre: str

    model_config = {"from_attributes": True}

class EncuestaDisponible(BaseModel):
    materia: str
    encuesta: str
    materia_id: int
    encuesta_id: int

from src.respuestas.schemas import Respuesta

class EncuestaCompletada(BaseModel):
    id: int
    anio: int
    periodo: str
    materia: dict
    encuesta: dict
    respuestas: list[Respuesta] = []

    model_config = {"from_attributes": True}
