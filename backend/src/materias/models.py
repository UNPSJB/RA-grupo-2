from __future__ import annotations
from sqlalchemy import Integer, String, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List, TYPE_CHECKING
from enum import auto, StrEnum
from src.models import ModeloBase
from src.asociaciones.models import alumno_materia
#con esto no da error de circulacion entre importaciones :/
if TYPE_CHECKING:
    from src.asociaciones.docente_materia.models import DocenteMateria
class Materia(ModeloBase):
    __tablename__ = "materias"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String, nullable=False,index=True)
    matricula: Mapped[str] = mapped_column(String, nullable=False,index=True)
    docentes_asociados: Mapped[List["DocenteMateria"]] = relationship("DocenteMateria", back_populates="materia")
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

    encuestas_completadas: Mapped[Optional[List["EncuestaCompletada"]]] = relationship(
        "EncuestaCompletada",
        back_populates="materia"
    )