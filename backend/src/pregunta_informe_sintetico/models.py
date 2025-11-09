from sqlalchemy import Integer, Text, ForeignKey, Enum, Column, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase
from typing import List

class PreguntaInformeSintetico(ModeloBase):
    __tablename__ = "preguntas_informe_sintetico"

    id = Column(Integer, primary_key=True, index=True)
    cod= Column(String, index=True)
    enunciado = Column(Text, nullable=False) 
    orden = Column(Integer, nullable=False) 
    informe_base_id = Column(Integer, ForeignKey("informes_sinteticos_base.id"), nullable=False)

    informe_base: Mapped["InformeSinteticoBase"] = relationship(
        "InformeSinteticoBase",
        back_populates="preguntas"
    )
    
    respuestas: Mapped[List["RespuestaInformeSintetico"]] = relationship(
        "RespuestaInformeSintetico",
        back_populates="pregunta"
    )