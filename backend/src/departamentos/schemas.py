from pydantic import BaseModel
from typing import List, Optional
from src.datosEstadisticos.schemas import DatosEstadisticosCategoria, OpcionPorcentaje
from src.sedes.schemas import Sede as SedeSchema

class DepartamentoBase(BaseModel):
    nombre: str
    sede_id: int

class Departamento(DepartamentoBase):
    id: int
    sede: Optional[SedeSchema] = None

    model_config = {"from_attributes": True}

class ProgresoResponse(BaseModel):
    completados: int
    pendientes: int

class PendienteResponse(BaseModel):
    materia: str
    docente_responsable: str

class EstadisticasResponse(BaseModel):
    promedio_por_categoria: List[DatosEstadisticosCategoria]
    promedio_general: List[OpcionPorcentaje]

class DashboardCompletoResponse(BaseModel):
    progreso: ProgresoResponse
    estadisticas_basico: EstadisticasResponse
    estadisticas_superior: EstadisticasResponse
    pendientes: List[PendienteResponse]