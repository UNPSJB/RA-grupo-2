from pydantic import BaseModel
from typing import List, Optional
from src.materias.schemas import Materia
from src.categorias.schemas import Categoria
from src.informe_catedra_completado.schemas import InformeCatedraCompletado
from src.categorias.schemas import CategoriaBase

class MateriaRef(BaseModel):
    id: int

class InformeCatedraBase(BaseModel):
    titulo: str

class InformeCatedra(InformeCatedraBase):
    id: int
    informes_completados: List[InformeCatedraCompletado] 
    materias: List[MateriaRef]  # Solo enviar { "id": <materia_id> }
    categorias: List[CategoriaBase]  # encuesta_id e informe_base_id opcionales

    class Config:
        from_attributes = True

class InformeCatedraCreate(InformeCatedraBase):
    pass