from pydantic import BaseModel
from typing import List

class OpcionPorcentaje(BaseModel):
    opcion_id: int
    porcentaje: float

class DatosEstadisticosPregunta(BaseModel):
    id_pregunta: int
    datos: List[OpcionPorcentaje]
