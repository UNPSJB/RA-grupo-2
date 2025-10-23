from sqlalchemy import Column, Integer, String, Text, Date,Enum,ForeignKey
from src.models import ModeloBase  
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.asociaciones.models import Periodo 
#from src.informe_catedra_completado.models import InformeCatedraCompletado 
#from src.materias.models import Materia 
#from src.categorias.models import Categoria
from typing import Optional, List

class InformeCatedra(ModeloBase):
    __tablename__ = "informe_catedra_base"

    id = Column(Integer, primary_key=True, index=True)
    informes_completados: Mapped[List["InformeCatedraCompletado"]] = relationship(
    "InformeCatedraCompletado",
    back_populates="informe_catedra_base"
    )   


   # materias: Mapped[Optional[List["Materia"]]] = relationship(
   #     "src.materias.models.Materia",
   #     back_populates="informe_catedra_base"
   # )
    categorias: Mapped[Optional[List["Categoria"]]] = relationship(
    "Categoria",
    back_populates="informe_catedra_base")
    titulo = Column(String, nullable=False)
    
    '''
    lista de informes completados
    lista de nmaterias 
    lista de categorias
    me baso en listar encuestas pendientes para el alumno 
    traer el informe de cada materia
                Como secretaría académica
                Quiero crear informe de cátedra base
                Para que los docentes los completen
    '''
    
