from pydantic import BaseModel
from datetime import date
from typing import List, Optional
from src.respuesta_informe_sintetico.schemas import RespuestaInformeSintetico
from src.respuesta_informe_sintetico import schemas as respuestas_schemas
from src.asociaciones.models import Periodo
from src.materias.schemas import Materia

class InformeSinteticoCompletadoBase(BaseModel):
    titulo: str
    contenido: str
    anio: int
    periodo: Periodo
    informe_base_id: int 

class InformeSinteticoCompletadoCreate(InformeSinteticoCompletadoBase):
    respuestas: List[respuestas_schemas.RespuestaInformeSinteticoBase]

class InformeSinteticoCompletado(InformeSinteticoCompletadoBase):
    id: int
    respuestas: List[RespuestaInformeSintetico]

    class Config:
        from_attributes = True

class TablaPregunta2BItem(BaseModel):
    materia: Materia
    encuesta_B: str
    encuesta_C: str
    encuesta_D: str
    encuesta_ET: str
    encuesta_EP: str
    juicio_valor: str

class TablaPregunta2Item(BaseModel):
    materia: Materia
    porcentaje_teoricas: str
    porcentaje_practicas: str
    justificacion: Optional[str] = None
