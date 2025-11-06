from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase
from typing import Optional, TYPE_CHECKING, List
from src.asociaciones.models import materia_carrera

if TYPE_CHECKING:
    from src.departamentos.models import Departamento

class Carrera(ModeloBase):
    __tablename__ = "carreras"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String, index=True)
    departamento_id: Mapped[int] = mapped_column(Integer, ForeignKey("departamentos.id"))
    departamento: Mapped["Departamento"] = relationship("Departamento", back_populates="carreras")
    informe_base = relationship("InformeSinteticoBase", back_populates="carrera")
    informe_completado = relationship("InformeSinteticoCompletado", back_populates="carrera")

    materias: Mapped[Optional[List["src.materias.models.Materia"]]] = relationship(
        "src.materias.models.Materia",
        secondary=materia_carrera,
        back_populates="carreras"
    )