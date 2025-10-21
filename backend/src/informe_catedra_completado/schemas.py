from pydantic import BaseModel
from datetime import date
from src.asociaciones.models import Periodo  
class InformeCatedraCompletadoBase(BaseModel):
    titulo: str
    anio: int
    periodo: Periodo
    docente_materia_id: int
    contenido: str
class InformeCatedraCompletadoCreate(InformeCatedraCompletadoBase):
    informe_base_id: int 
    pass

class InformeCatedraCompletado(InformeCatedraCompletadoBase):
    id: int

    class Config:
        from_attributes = True

