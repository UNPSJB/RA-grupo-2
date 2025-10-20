from sqlalchemy import Integer, Float, String, ForeignKey, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase
from typing import Optional, List

class DatosEstadisticosInforme(ModeloBase):
    __tablename__ = "datos_estadisticos_informe"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    id_informe_catedra_completado: Mapped[int] = mapped_column(
        ForeignKey("informes_catedra.id"), index=True
    )

    id_pregunta_encuesta: Mapped[int] = mapped_column(
        ForeignKey("preguntas.id"), index=True
    )

    datos_pregunta: Mapped[Optional[List["DatosEstadisticosPregunta"]]] = relationship(
        "DatosEstadisticosPregunta",
        back_populates="informe"
    )


class DatosEstadisticosPregunta(ModeloBase):
    __tablename__ = "datos_estadisticos_pregunta"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    id_datos_estadisticos_informe: Mapped[int] = mapped_column(
        ForeignKey("datos_estadisticos_informe.id"), index=True
    )

    id_opcion: Mapped[int] = mapped_column(ForeignKey("opciones.id"), index=True)
    porcentaje: Mapped[float] = mapped_column(Float)

    informe: Mapped["DatosEstadisticosInforme"] = relationship(
        "DatosEstadisticosInforme",
        back_populates="datos_pregunta"
    )
