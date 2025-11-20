from sqlalchemy import Integer, ForeignKey, Text, Column
from sqlalchemy.orm import Mapped, relationship, mapped_column
from src.models import ModeloBase

class RespuestaInformeSintetico(ModeloBase):
    __tablename__ = "respuestas_informe_sintetico"

    id = Column(Integer, primary_key=True, index=True)
    texto_respuesta = Column(Text, nullable=False) 
    pregunta_id = Column(Integer, ForeignKey("preguntas_informe_sintetico.id"), nullable=False)
    informe_completado_id = Column(Integer, ForeignKey("informe_sintetico_completado.id"), nullable=False)
    materia_id: Mapped[int] = mapped_column(ForeignKey("materias.id"), nullable=True)
    materia: Mapped["Materia"] = relationship() # <-- ¡AÑADE ESTA LÍNEA!
    pregunta: Mapped["PreguntaInformeSintetico"] = relationship(
        "PreguntaInformeSintetico", 
        back_populates="respuestas"
    )
    informe_completado: Mapped["InformeSinteticoCompletado"] = relationship(
        "InformeSinteticoCompletado", 
        back_populates="respuestas"
    )
    