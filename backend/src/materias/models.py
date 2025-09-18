from sqlalchemy import Integer, String, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List
from enum import auto, StrEnum
from src.models import ModeloBase
from src.asociaciones.models import alumno_materia


class Materia(ModeloBase):
    __tablename__ = "materias"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String, nullable=False,index=True)
    matricula: Mapped[str] = mapped_column(String, nullable=False,index=True)
    #foránea para referenciar al docente
    docente_id: Mapped[int] = mapped_column(Integer, ForeignKey('docentes.id'))
    docente = relationship("Docente", back_populates="materias")
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