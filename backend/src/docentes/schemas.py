from pydantic import BaseModel
from typing import List, Optional
from src.datosEstadisticos.schemas import DatosEstadisticosCategoria, OpcionPorcentaje

class DocenteBase(BaseModel):
    nombre: str
    apellido: str
    model_config= {
        "json_schema_extra":{
            "example":{
                "nombre": "Maria",
                "apellido": "Nuñez",
            }
        }
    }

class Docente(DocenteBase):
       id: int
       model_config = {"from_attributes": True}

class MateriaInfo(BaseModel):
    id: int
    nombre: str
    codigo: str
        
class EstadisticasDocenteResponse(BaseModel):
    promedio_por_categoria: List[DatosEstadisticosCategoria]
    promedio_general: List[OpcionPorcentaje]

class ProgresoData(BaseModel):
    completados: int
    pendientes: int

class InformePendienteInfo(BaseModel):
    materia: str
    docente_responsable: str

class DashboardDocenteResponse(BaseModel):
    total_encuestas_completadas: int
    estadisticas_general: List[OpcionPorcentaje] 
    estadisticas_basico: Optional[EstadisticasDocenteResponse] = None
    estadisticas_superior: Optional[EstadisticasDocenteResponse] = None
    materias_del_ciclo: List[MateriaInfo]
    progreso: ProgresoData
    pendientes: List[InformePendienteInfo] 