from sqlalchemy import Integer, String, ForeignKey, Enum, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List
from enum import auto, StrEnum
from src.models import ModeloBase


class Docente(ModeloBase):
    __tablename__ = "docentes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String, nullable=False,index=True)
    apellido: Mapped[str] = mapped_column(String, nullable=False,index=True)
    materias = relationship("Materia", back_populates="docente")
    # al ser relacion de muchos a muchos, hay que hacer una tabla intermedia (docente_materia)
    # secondary: docente_materia
    # back_populates: crea relación bidireccional