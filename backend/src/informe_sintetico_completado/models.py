from sqlalchemy import Column, Integer, String, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship, Mapped, mapped_column
from src.models import ModeloBase
from src.asociaciones.models import Periodo 
from typing import List

class InformeSinteticoCompletado(ModeloBase):
    __tablename__ = "informe_sintetico_completado" 

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(255), nullable=False)
    contenido = Column(Text, nullable=False)
    anio: Mapped[int] = mapped_column(Integer, nullable=False)
    periodo: Mapped[Periodo] = mapped_column(Enum(Periodo), nullable=False) 
    informe_base_id = Column(Integer, ForeignKey("informes_sinteticos_base.id"), nullable=False)
    informe_base: Mapped["InformeSinteticoBase"] = relationship(
        "InformeSinteticoBase", 
        back_populates="informes_completados"
    )
    respuestas: Mapped[List["RespuestaInformeSintetico"]] = relationship(
        "RespuestaInformeSintetico", 
        back_populates="informe_completado"
    )
    carrera_id = Column(Integer, ForeignKey("carreras.id"), nullable=True)
    carrera = relationship("Carrera", back_populates="informe_completado")