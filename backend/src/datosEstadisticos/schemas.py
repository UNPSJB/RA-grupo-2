from pydantic import BaseModel
from typing import List

class OpcionPorcentaje(BaseModel):
    opcion_id: str
    porcentaje: float

class DatosEstadisticosPregunta(BaseModel):
    id_pregunta: str
    datos: List[OpcionPorcentaje]

class DatosEstadisticosCategoria(BaseModel):
    categoria_cod: str
    categoria_texto: str
    promedio_categoria: List[OpcionPorcentaje]
    preguntas: List[DatosEstadisticosPregunta]
