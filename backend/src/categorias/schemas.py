from pydantic import BaseModel, field_validator, Field
from src.categorias import exceptions
from typing import List, Optional
from src import Opcion

class CategoriaBase(BaseModel):
    cod: str
    texto: str
    encuesta_id: Optional[int] = None  
    informe_base_id: Optional[int] = None
class Categoria(CategoriaBase):
    id: int
       
class CategoriaCreate(CategoriaBase):
    pass
