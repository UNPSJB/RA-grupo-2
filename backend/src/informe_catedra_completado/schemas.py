from pydantic import BaseModel
from src.asociaciones.models import Periodo
from src.respuestasInforme import schemas as respuestas_schemas
from typing import List, Optional

class InformeCatedraCompletadoBase(BaseModel):
    docente_materia_id: int
    informe_catedra_base_id: int
    titulo: Optional[str] = None
    contenido: Optional[str] = None
    cantidadAlumnos: Optional[int] = None
    anio: Optional[int] = None
    periodo: Optional[Periodo] = None
    cantidadComisionesTeoricas: Optional[int] = None
    cantidadComisionesPracticas: Optional[int] = None

class InformeCatedraCompletadoCreate(InformeCatedraCompletadoBase):
    pass

class InformeCatedraCompletadoConRespuestasCreate(InformeCatedraCompletadoBase):
    respuestas: List[respuestas_schemas.RespuestaInformeBase]
    

class InformeCatedraCompletado(InformeCatedraCompletadoBase):
    id: int
    model_config = {"from_attributes": True}

class InformePendiente(BaseModel):
    materia_id: int
    materia_nombre: str
    docente_materia_id: int
    model_config = {"from_attributes": True}