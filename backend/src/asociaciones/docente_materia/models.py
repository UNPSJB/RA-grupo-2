from sqlalchemy import ForeignKey, Enum, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase
from src.asociaciones.models import Periodo  
from typing import TYPE_CHECKING


if TYPE_CHECKING:
    from src.docentes.models import Docente
    from src.materias.models import Materia
class DocenteMateria(ModeloBase):
    __tablename__ = "docente_materia"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index = True)
    docente_id: Mapped[int] = mapped_column(ForeignKey("docentes.id"))
    materia_id: Mapped[int] = mapped_column(ForeignKey("materias.id"))
    anio: Mapped[int] = mapped_column(Integer, nullable=False)
    periodo: Mapped[Periodo] = mapped_column(Enum(Periodo), nullable=False)
    

    docente: Mapped["Docente"] = relationship("Docente", back_populates="materias_asociadas")
    materia: Mapped["Materia"] = relationship("Materia", back_populates="docentes_asociados")
