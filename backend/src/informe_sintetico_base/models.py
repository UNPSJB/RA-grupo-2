from sqlalchemy import Column, Integer, String, Text, ForeignKey
from src.models import ModeloBase  
from sqlalchemy.orm import Mapped, relationship
from typing import Optional, List


class InformeSinteticoBase(ModeloBase):
    __tablename__ = "informes_sinteticos_base"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(255), nullable=False)
    descripcion = Column(Text, nullable=True) 
    carrera_id = Column(Integer, ForeignKey("carreras.id"), nullable=True)
    carrera = relationship("Carrera", back_populates="informe_base")
    informes_completados: Mapped[List["InformeSinteticoCompletado"]] = relationship(
        "InformeSinteticoCompletado",
        back_populates="informe_base"
    )
    preguntas: Mapped[List["PreguntaInformeSintetico"]] = relationship(
        "PreguntaInformeSintetico",
        back_populates="informe_base"
    )