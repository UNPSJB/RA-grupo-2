from pydantic import BaseModel
from datetime import date
from src.asociaciones.models import Periodo  
class InformeCatedraBase(BaseModel):
    titulo: str
    anio: int
    periodo: Periodo
    docente_materia_id: int
    contenido: str
class InformeCatedraCreate(InformeCatedraBase):
    pass

class InformeCatedra(InformeCatedraBase):
    id: int

    class Config:
        from_attributes = True

