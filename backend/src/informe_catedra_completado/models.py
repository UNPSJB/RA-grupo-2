from sqlalchemy import Column, Integer, String, Text, Date,Enum,ForeignKey
from src.models import ModeloBase  
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.asociaciones.models import Periodo  
from typing import Optional

class InformeCatedraCompletado(ModeloBase):
    __tablename__ = "informes_catedra_completado"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    contenido = Column(Text, nullable=False)
    anio: Mapped[int] = mapped_column(Integer, nullable=False)
    periodo: Mapped[Periodo] = mapped_column(Enum(Periodo), nullable=False)
    docente_materia_id = Column(Integer, ForeignKey("docente_materia.id"), nullable=False)
    docente_materia = relationship("DocenteMateria")
    informe_base_id = Column(Integer, ForeignKey("informe_catedra_base.id"), nullable=False)
    informe_catedra_base = relationship(
        "InformeCatedra",
        back_populates="informes_completados"
    )
    #docente_id: Mapped[int] = mapped_column(ForeignKey("docentes.id"), nullable=True)
    #materia_id: Mapped[int] = mapped_column(ForeignKey("materias.id"), nullable=True)
