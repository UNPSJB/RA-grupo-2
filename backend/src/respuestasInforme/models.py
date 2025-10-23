from sqlalchemy import Integer, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase

class RespuestaInforme(ModeloBase):
    __tablename__ = "respuestas_informe"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    pregunta_id: Mapped[int] = mapped_column(ForeignKey("preguntas.id"))
    opcion_id: Mapped[int] = mapped_column(ForeignKey("opciones.id"), nullable=True)
    informe_catedra_completado_id: Mapped[int] = mapped_column(ForeignKey("informe_catedra_completado.id"))

    texto_respuesta: Mapped[str | None] = mapped_column(String(150), nullable=True)
    
    pregunta: Mapped["Pregunta"] = relationship("Pregunta")
    opcion: Mapped["Opcion"] = relationship("Opcion")
    informe_catedra_completado: Mapped["InformeCatedraCompletado"] = relationship("InformeCatedraCompletado", back_populates="respuestas_informe")

