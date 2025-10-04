from sqlalchemy import Integer, String, ForeignKey, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase
from typing import Optional, List
from src.asociaciones.models import pregunta_opcion

class Pregunta(ModeloBase):
    __tablename__ = "preguntas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    enunciado: Mapped[String] = mapped_column(String, index=True)

    categoria_id: Mapped[int] = mapped_column(
        ForeignKey("categorias.id")
    )  # Foreign key a Categoria

    categoria: Mapped["src.categorias.models.Categoria"] = relationship(
        "src.categorias.models.Categoria", back_populates="preguntas"   
    )

    encuesta_id: Mapped[int] = mapped_column(
        ForeignKey("encuestas.id")
    )  # Foreign key a Encuesta

    encuesta: Mapped["src.encuestas.models.Encuesta"] = relationship(
        "src.encuestas.models.Encuesta", back_populates="preguntas"
    )

    opciones: Mapped[Optional[List["src.opciones.models.Opcion"]]] = relationship(
        "src.opciones.models.Opcion",
        secondary=pregunta_opcion,
        back_populates="preguntas"
    )


    
