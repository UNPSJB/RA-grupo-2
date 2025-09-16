from sqlalchemy import Integer, String, ForeignKey, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase
from typing import Optional, List
from src.asociaciones.models import alumno_materia
from enum import auto, StrEnum

class Periodo(StrEnum):
    PRIMER_CUATRI = auto()
    SEGUNDO_CUATRI = auto()
    ANUAL = auto()


class CursadaMateria(ModeloBase):
    __tablename__ = "cursadas_materias"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    periodo: Mapped[Periodo] = mapped_column(String, index = True)
    anio: Mapped[int] = mapped_column(Integer, index=True)

    materia_id: Mapped[int] = mapped_column(
        ForeignKey("materias.id")
    )

    materia: Mapped["src.materias.models.Materia"] = relationship(
        "src.materias.models.Materia", back_populates="cursadas"
    )

    alumnos: Mapped[Optional[List["src.alumnos.models.Alumno"]]] = relationship(
        "src.alumnos.models.Alumno",
        secondary=alumno_materia,
        back_populates="materias"
    )

    encuesta_id: Mapped[int] = mapped_column(
        ForeignKey("encuestas.id")
    )  # Foreign key a Encuesta

    encuesta: Mapped["src.encuestas.models.Encuesta"] = relationship(
        "src.encuestas.models.Encuesta", back_populates="materias"
    )

