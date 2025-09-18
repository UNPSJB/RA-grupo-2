from pydantic import BaseModel
from datetime import date

class InformeSinteticoBase(BaseModel):
    titulo: str
    descripcion: str
    fecha: date

class InformeSinteticoCreate(InformeSinteticoBase):
    pass

class InformeSintetico(InformeSinteticoBase):
    id: int

    class Config:
        orm_mode = True
