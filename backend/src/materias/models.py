from sqlalchemy import Integer, String, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List
from enum import auto, StrEnum
from src.models import ModeloBase


class Materia(ModeloBase):
    __tablename__ = "materias"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String, nullable=False,index=True)
    matricula: Mapped[str] = mapped_column(String, nullable=False,index=True)
    #foránea para referenciar al docente
    docente_id: Mapped[int] = mapped_column(Integer, ForeignKey('docentes.id'))
    docente = relationship("Docente", back_populates="materias")
