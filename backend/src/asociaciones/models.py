from sqlalchemy import Integer, String, ForeignKey, Table, Column
from src.models import ModeloBase
from enum import auto, StrEnum

class Periodo(StrEnum):
    PRIMER_CUATRI = "PRIMER_CUATRI"
    SEGUNDO_CUATRI = "SEGUNDO_CUATRI"
    ANUAL = "ANUAL"

alumno_materia = Table(
    "alumno_materia",
    ModeloBase.metadata,
    Column("alumno_id", ForeignKey("alumnos.id"), primary_key=True),
    Column("materia_id", ForeignKey("materias.id"), primary_key=True),
    Column("nota_cursada", Integer),
    Column("anio", Integer),
    Column("periodo", String)
)