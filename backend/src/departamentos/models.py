from sqlalchemy import Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from src.carreras.models import Carrera
    from src.materias.models import Materia
    from src.sedes.models import Sede

class Departamento(ModeloBase):
    __tablename__ = "departamentos"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String, index=True)
    sede_id: Mapped[int] = mapped_column(ForeignKey("sedes.id"))
    
    carreras: Mapped[Optional[List["Carrera"]]] = relationship("Carrera", back_populates="departamento")
    materias: Mapped[List["Materia"]] = relationship("Materia", back_populates="departamento")
    sede: Mapped["Sede"] = relationship("Sede", back_populates="departamentos")

    user: Mapped[Optional["User"]] = relationship("User", back_populates="departamento")