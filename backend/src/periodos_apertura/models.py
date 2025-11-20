from sqlalchemy import Integer, Enum, Date
from sqlalchemy.orm import Mapped, mapped_column
from src.models import ModeloBase
from src.asociaciones.models import Periodo
import datetime

class PeriodoApertura(ModeloBase):
    __tablename__ = "periodo_apertura"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    anio: Mapped[int] = mapped_column(Integer)
    periodo: Mapped[Periodo] = mapped_column(Enum(Periodo))
    inicio_encuesta: Mapped[datetime.date] = mapped_column(Date)
    fin_encuesta: Mapped[datetime.date] = mapped_column(Date)
    inicio_informe_catedra: Mapped[datetime.date] = mapped_column(Date)
    fin_informe_catedra: Mapped[datetime.date] = mapped_column(Date)
    inicio_informe_sintetico: Mapped[datetime.date] = mapped_column(Date)
    fin_informe_sintetico: Mapped[datetime.date] = mapped_column(Date)
