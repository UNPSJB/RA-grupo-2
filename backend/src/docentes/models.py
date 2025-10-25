from __future__ import annotations
from sqlalchemy import Integer, String, ForeignKey, Enum, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List
from enum import auto, StrEnum
from typing import List, TYPE_CHECKING
from src.models import ModeloBase

if TYPE_CHECKING:
    from src.asociaciones.docente_materia.models import DocenteMateria
class Docente(ModeloBase):
    __tablename__ = "docentes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String, nullable=False,index=True)
    apellido: Mapped[str] = mapped_column(String, nullable=False,index=True)
    materias_asociadas: Mapped[List["DocenteMateria"]] =  relationship("DocenteMateria", back_populates="docente")

   # informe_catedra_completado: Mapped[list["InformeCatedraCompletado"]] = relationship("InformeCatedraCompletado", back_populates="docente")
