from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey
from sqlalchemy.orm import relationship, Mapped
from src.models import ModeloBase
from typing import List

class InformeSinteticoCompletado(ModeloBase):
    __tablename__ = "informe_sintetico_completado" 

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(255), nullable=False)
    contenido = Column(Text, nullable=False)
    fecha = Column(Date, nullable=False) 
    informe_base_id = Column(Integer, ForeignKey("informes_sinteticos_base.id"), nullable=False)
    informe_base: Mapped["InformeSinteticoBase"] = relationship(
        "InformeSinteticoBase", 
        back_populates="informes_completados"
    )
    respuestas: Mapped[List["RespuestaInformeSintetico"]] = relationship(
        "RespuestaInformeSintetico", 
        back_populates="informe_completado"
    )