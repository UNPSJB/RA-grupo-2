from pydantic import BaseModel

class MateriaBase(BaseModel):
    nombre: str

class Materia(MateriaBase):
    id: int
    nombre: str

    model_config = {"from_attributes": True}

class AlumnoMateriaBase(BaseModel):
    alumno_id: int
    nota: int

class AlumnoMateria(AlumnoMateriaBase):
    alumno_id: int