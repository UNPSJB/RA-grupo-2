from pydantic import BaseModel, field_validator
from src.cursadasMaterias.models import Periodo
from src.cursadasMaterias import exceptions

class CursadaMateriaBase(BaseModel):
    nombre: str

class CursadaMateria(CursadaMateriaBase):
    id: int
    anio: int
    periodo: Periodo

    @field_validator("periodo", mode="before")
    @classmethod
    def is_valid_periodo(cls, v: str) -> str:
        if v.lower() not in Periodo:
            raise exceptions.PeriodoInvalido(list(Periodo))
        return v.lower()

    model_config = {"from_attributes": True}

class AlumnoMateriaBase(BaseModel):
    alumno_id: int
    nota: int

class AlumnoMateria(AlumnoMateriaBase):
    alumno_id: int