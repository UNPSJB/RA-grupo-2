from pydantic import BaseModel, field_validator, Field
from src.preguntas import exceptions
from typing import List, Optional
from src import Opcion

class PreguntaBase(BaseModel):
    enunciado: str
    tipo: Optional[str] = None  # nuevo campo
    
class PreguntaCerradaCreate(PreguntaBase):
    categoria_id: int
    enunciado: str
    opcion_ids: List[int] = Field(..., min_length=1)

    @field_validator("opcion_ids")
    @classmethod
    def validar_minimo_opciones(cls, v):
        if not v or len(v) < 1:
            raise ValueError("La pregunta debe tener al menos una opción existente")
        return v

class Pregunta(PreguntaBase):
    id: int
    enunciado: str
    categoria_id: int
    opciones: List[Opcion]

    model_config = {"from_attributes": True}


class PreguntaCerrada(Pregunta):
    #opciones: List[Opcion]

    model_config = {"from_attributes": True}

#Pregunta Abierta

class PreguntaAbiertaCreate(PreguntaBase):
    categoria_id: int
    enunciado: str

class PreguntaAbierta(Pregunta):
   #Representa una pregunta abierta (sin opciones).

    
    model_config = {"from_attributes": True}