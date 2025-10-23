from pydantic import BaseModel
from typing import List

class OpcionPorcentaje(BaseModel):
    opcion_id: str
    porcentaje: float

class DatosEstadisticosPregunta(BaseModel):
    id_pregunta: str
    datos: List[OpcionPorcentaje]
