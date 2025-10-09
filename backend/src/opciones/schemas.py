from pydantic import BaseModel, field_validator
from src.opciones import exceptions


class OpcionBase(BaseModel):
    contenido: str

class OpcionCreate(OpcionBase):
    pass

class Opcion(OpcionBase):
    id: int
    contenido: str

    model_config = {"from_attributes": True}
