from src.informe_catedra_base.models import InformeCatedra
from sqlalchemy import Integer, String, ForeignKey, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase
from typing import Optional, List
from src.asociaciones.models import pregunta_opcion

class Categoria(ModeloBase):
    __tablename__ = "categorias"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    cod: Mapped[str] = mapped_column(String, nullable=False)
    texto: Mapped[str] = mapped_column(String, nullable=False)
    encuesta_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("encuestas.id"), nullable=True) 

    encuesta: Mapped[Optional["src.encuestas.models.Encuesta"]] = relationship(
        "src.encuestas.models.Encuesta", back_populates="categorias"
    )

    preguntas: Mapped[Optional[List["src.preguntas.models.Pregunta"]]] = relationship(
        "src.preguntas.models.Pregunta",
        back_populates="categoria"
    )
    informe_base_id: Mapped[Optional[int]] = mapped_column(ForeignKey("informe_catedra_base.id"), nullable=True)
    informe_catedra_base: Mapped[Optional["InformeCatedra"]] = relationship(
        "InformeCatedra",
        back_populates="categorias"
    )
