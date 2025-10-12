# src/encuestaCompletada/models.py
from sqlalchemy import Integer, ForeignKey, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase
from datetime import datetime
from src.asociaciones.models import Periodo
from src.alumnos.models import Alumno
from src.encuestas.models import Encuesta
from src.materias.models import Materia
from src.respuestas.models import Respuesta

class EncuestaCompletada(ModeloBase):
    __tablename__ = "encuestas_completadas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    alumno_id: Mapped[int] = mapped_column(ForeignKey("alumnos.id"), nullable=False)
    encuesta_id: Mapped[int] = mapped_column(ForeignKey("encuestas.id"), nullable=False)
    materia_id: Mapped[int] = mapped_column(ForeignKey("materias.id"), nullable=False)
    # fecha_completada: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    anio: Mapped[int] = mapped_column(Integer, nullable=False)
    periodo: Mapped[Periodo] = mapped_column(Enum(Periodo), nullable=False)

    alumno: Mapped["Alumno"] = relationship("Alumno", back_populates="encuestas_completadas")
    encuesta: Mapped["Encuesta"] = relationship("Encuesta", back_populates="encuestas_completadas")
    materia: Mapped["Materia"] = relationship("Materia", back_populates="encuestas_completadas")
    respuestas: Mapped[list["Respuesta"]] = relationship("Respuesta", back_populates="encuesta_completada")



