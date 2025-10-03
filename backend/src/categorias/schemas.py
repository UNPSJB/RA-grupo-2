from pydantic import BaseModel, field_validator, Field
from src.categorias import exceptions
from typing import List, Optional
from src import Opcion

class CategoriaBase(BaseModel):
    id: int
    cod: str
    texto: str

class Categoria(CategoriaBase):
    pass

class CategoriaCreate(CategoriaBase):
    pass
