from sqlalchemy import Integer, String, ForeignKey, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase
from typing import Optional, List
from src.asociaciones.models import alumno_materia

class Alumno(ModeloBase):
    __tablename__ = "alumnos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    CUIL: Mapped[String] = mapped_column(String, index=True)
    nombre: Mapped[String] = mapped_column(String, index=True)
    apellido: Mapped[String] = mapped_column(String, index=True)
    usuario: Mapped[String] = mapped_column(String, index=True)
    clave: Mapped[String] = mapped_column(String, index=True)
    
    materias: Mapped[Optional[List["src.materias.models.Materia"]]] = relationship(
        "src.materias.models.Materia",
        secondary=alumno_materia,
        back_populates="alumnos"
    )
