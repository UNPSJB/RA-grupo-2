from pydantic import BaseModel, field_validator
from src.alumnos import exceptions


class AlumnoBase(BaseModel):
    nombre: str
    apellido: str
    usuario: str


class Alumno(AlumnoBase):
    id: int
    nombre: str
    apellido: str
    usuario: str

    model_config = {"from_attributes": True}

class AlumnoMateriaBase(BaseModel):
    materia_id: int
    nota: int

class AlumnoListarEncuestasDisponibles(AlumnoMateriaBase):
    pass

class AlumnoMateria(AlumnoMateriaBase):
    materia_id: int