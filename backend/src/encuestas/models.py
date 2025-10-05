from sqlalchemy import Integer, String, ForeignKey, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase
from typing import Optional, List
from src.asociaciones.models import alumno_materia


class Encuesta(ModeloBase):
    __tablename__ = "encuestas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre: Mapped[String] = mapped_column(String, index=True)
    
    materias: Mapped[Optional[List["src.materias.models.Materia"]]] = relationship(
        "src.materias.models.Materia",
        back_populates="encuesta"
    )
    
    preguntas: Mapped[Optional[List["src.preguntas.models.Pregunta"]]] = relationship(
        "src.preguntas.models.Pregunta",
        back_populates="encuesta"
    )

    encuestas_completadas: Mapped[Optional[List["EncuestaCompletada"]]] = relationship(
        "EncuestaCompletada",
        back_populates="encuesta"
    )
