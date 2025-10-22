from pydantic import BaseModel
from typing import List, Optional
from src.materias.schemas import Materia
from src.informe_catedra_completado.schemas import InformeCatedraCompletado
from src.categorias.schemas import Categoria

class InformeCatedraBase(BaseModel):
    titulo: str

class InformeCatedra(InformeCatedraBase):
    id: int
    informes_completados: List[InformeCatedraCompletado] 
    categorias: List[Categoria]  

    class Config:
        from_attributes = True

class InformeCatedraCreate(InformeCatedraBase):
    pass