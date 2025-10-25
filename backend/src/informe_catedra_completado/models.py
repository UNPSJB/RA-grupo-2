from sqlalchemy import Integer, ForeignKey, Enum, Text, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase
from src.asociaciones.models import Periodo
from typing import List, Optional

class InformeCatedraCompletado(ModeloBase):
   __tablename__ = "informe_catedra_completado"

   id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
   docente_materia_id: Mapped[int] = mapped_column(ForeignKey("docente_materia.id"))
   
   informe_catedra_base_id: Mapped[int] = mapped_column(ForeignKey("informe_catedra_base.id"))
   
   titulo: Mapped[Optional[str]] = mapped_column(String, nullable=True)
   contenido: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
   cantidadAlumnos: Mapped[Optional[str]] = mapped_column(String, nullable=True)
   anio: Mapped[int] = mapped_column(Integer, nullable=True)
   periodo: Mapped[Periodo] = mapped_column(Enum(Periodo), nullable=True)


   docente_materia: Mapped["DocenteMateria"] = relationship("DocenteMateria")
   informe_catedra_base: Mapped["InformeCatedra"] = relationship(
      "InformeCatedra", 
      back_populates="informes_completados"
   )
   respuestas_informe: Mapped[List["RespuestaInforme"]] = relationship(
      "RespuestaInforme", 
      back_populates="informe_catedra_completado"
   )


