from sqlalchemy import Integer, String, ForeignKey, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase
from typing import Optional, List
from src.asociaciones.models import alumno_materia


class Materia(ModeloBase):
    __tablename__ = "materias"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre: Mapped[String] = mapped_column(String, index=True)
    
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

