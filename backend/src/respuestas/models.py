from sqlalchemy import Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase

class Respuesta(ModeloBase):
    __tablename__ = "respuestas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    pregunta_id: Mapped[int] = mapped_column(ForeignKey("preguntas.id"))
    opcion_id: Mapped[int] = mapped_column(ForeignKey("opciones.id"))
    encuesta_completada_id: Mapped[int] = mapped_column(ForeignKey("encuestas_completadas.id"))
    
    pregunta: Mapped["Pregunta"] = relationship("Pregunta", back_populates="respuestas")
    opcion: Mapped["Opcion"] = relationship("Opcion", back_populates="respuestas")
    encuesta_completada: Mapped["EncuestaCompletada"] = relationship("EncuestaCompletada", back_populates="respuestas")