from sqlalchemy import Integer, ForeignKey, Table, Column
from src.models import ModeloBase

alumno_materia = Table(
    "alumno_materia",
    ModeloBase.metadata,
    Column("alumno_id", ForeignKey("alumnos.id"), primary_key=True),
    Column("materia_id", ForeignKey("materias.id"), primary_key=True),
    Column("notaCursada", Integer)
)