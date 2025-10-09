from sqlalchemy import Integer, String, ForeignKey, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase
from typing import Optional, List
from src.asociaciones.models import pregunta_opcion

class Opcion(ModeloBase):
    __tablename__ = "opciones"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    contenido: Mapped[String] = mapped_column(String, index=True)

    preguntas: Mapped[Optional[List["src.preguntas.models.Pregunta"]]] = relationship(
        "src.preguntas.models.Pregunta",
        secondary=pregunta_opcion,
        back_populates="opciones"
    )


    
