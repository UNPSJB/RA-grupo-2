from pydantic import BaseModel
from datetime import date
from typing import List, Optional
from src.respuesta_informe_sintetico.schemas import RespuestaInformeSintetico
from src.respuesta_informe_sintetico import schemas as respuestas_schemas
from src.asociaciones.models import Periodo
from src.materias.schemas import Materia

class InformeSinteticoCompletadoBase(BaseModel):
    titulo: str
    contenido: str
    anio: int
    periodo: Periodo
    informe_base_id: int 
    carrera_id: int

class InformeSinteticoCompletadoCreate(InformeSinteticoCompletadoBase):
    respuestas: List[respuestas_schemas.RespuestaInformeSinteticoBase]

class InformeSinteticoCompletado(InformeSinteticoCompletadoBase):
    id: int
    respuestas: List[RespuestaInformeSintetico]

    class Config:
        from_attributes = True

class TablaPregunta2BItem(BaseModel):
    materia: Materia
    encuesta_B: str
    encuesta_C: str
    encuesta_D: str
    encuesta_ET: str
    encuesta_EP: str
    juicio_valor: str

class TablaPregunta2Item(BaseModel):
    materia: Materia
    porcentaje_teoricas: str
    porcentaje_practicas: str
    justificacion: Optional[str] = None

class InformacionGeneral(BaseModel):
    materia: Materia
    codigo: str
    nombre: str
    cantidad_alumnos: int
    cantidad_comisiones_teoricas: int
    cantidad_comisiones_practicas: int

    model_config = {"from_attributes": True}   
    
class TemasDesarrolladosItem(BaseModel):
    materia: Materia
    porcentaje_texto: Optional[str] = None 
    estrategias_texto: Optional[str] = None

    model_config = {"from_attributes": True}

class RespuestasSeccion2C(BaseModel):
    aspectos_positivos_ensenanza: Optional[str] = None
    aspectos_positivos_aprendizaje: Optional[str] = None
    obstaculos_ensenanza: Optional[str] = None
    obstaculos_aprendizaje: Optional[str] = None
    estrategias: Optional[str] = None
    

class TablaPregunta2CItem(BaseModel):
    materia: Materia
    respuestas: RespuestasSeccion2C

    model_config = {"from_attributes": True}
    
class DocenteActividades(BaseModel):
    capacitacion: Optional[str] = None
    investigacion: Optional[str] = None
    extension: Optional[str] = None
    gestion: Optional[str] = None
    observaciones: Optional[str] = None

class DocenteConActividades(BaseModel):
    nombre_docente: str
    rol_docente: str
    actividades: DocenteActividades


class ActividadesPorMateriaItem(BaseModel):
    materia: Materia
    docentes: List[DocenteConActividades]

    model_config = {"from_attributes": True}

class EquipamientoBibliografia(BaseModel):
    materia: Materia
    bibliografia: str
    equipamiento: str

class DesempenoAuxiliarDetalle(BaseModel):
    espacio_curricular: str
    nombre_apellido: str
    calificacion_E: bool = False  
    calificacion_MB: bool = False 
    calificacion_B: bool = False  
    calificacion_R: bool = False  
    calificacion_I: bool = False  
    justificacion: str

class TablaDesempenoAuxiliar(BaseModel):
    materia: Materia
    auxiliares: List[DesempenoAuxiliarDetalle]
    
    model_config = {"from_attributes": True}