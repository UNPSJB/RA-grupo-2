from pydantic import BaseModel

class EncuestaBase(BaseModel):
    nombre: str

class Encuesta(EncuestaBase):
    id: int
    nombre: str

    model_config = {"from_attributes": True}

    
class EncuestaDisponible(BaseModel):
    materia: str
    encuesta: str
    materia_id: int
    encuesta_id: int