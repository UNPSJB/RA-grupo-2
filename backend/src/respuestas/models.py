from sqlalchemy import Integer, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase

class Respuesta(ModeloBase):
    __tablename__ = "respuestas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    pregunta_id: Mapped[int] = mapped_column(ForeignKey("preguntas.id"))
    opcion_id: Mapped[int] = mapped_column(ForeignKey("opciones.id"), nullable=True)
    encuesta_completada_id: Mapped[int] = mapped_column(ForeignKey("encuestas_completadas.id"))

    texto_respuesta: Mapped[str | None] = mapped_column(String(150), nullable=True)
    
    pregunta: Mapped["Pregunta"] = relationship("Pregunta")
    opcion: Mapped["Opcion"] = relationship("Opcion")
    encuesta_completada: Mapped["EncuestaCompletada"] = relationship("EncuestaCompletada", back_populates="respuestas")
    