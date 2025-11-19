from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from src.database import get_db
from src.departamentos import schemas, services
from src.asociaciones.models import Periodo
from src.carreras.schemas import Carrera
from . import schemas
from . import services
from src.informe_catedra_completado import services as informe_services
from src.datosEstadisticos import services as estadisticas_services

router = APIRouter(prefix="/departamentos", tags=["departamentos"])

@router.get("/", response_model=list[schemas.Departamento])
def leer_departamentos(db: Session = Depends(get_db)):
    return services.listar_departamentos(db)

@router.get("/{departamento_id}", response_model=schemas.Departamento)
def leer_departamento(departamento_id: int, db: Session = Depends(get_db)):
    return services.leer_departamento(db, departamento_id)

@router.get("/{departamento_id}/carreras", response_model=List[Carrera])
def get_carreras_por_departamento(departamento_id: int, db: Session = Depends(get_db)):
    return services.get_carreras_por_departamento(db, departamento_id)

@router.get("/{departamento_id}/dashboard-completo", response_model=schemas.DashboardCompletoResponse)
def get_dashboard_completo( departamento_id: int, anio: int, periodo: Periodo, carrera_id: int | None = None, 
    db: Session = Depends(get_db)):
    progreso = informe_services.get_progreso_departamento(
        db, departamento_id, anio, periodo, carrera_id
    )

    estadisticas_basico = estadisticas_services.get_promedio_encuestas_BASICO(
        db, departamento_id, anio, periodo, carrera_id
    )
    
    estadisticas_superior = estadisticas_services.get_promedio_encuestas_SUPERIOR(
        db, departamento_id, anio, periodo, carrera_id
    )
 
    pendientes = informe_services.obtener_informes_pendientes_por_departamento(
        db, departamento_id, anio, periodo, carrera_id
    )

    return schemas.DashboardCompletoResponse(
        progreso=progreso,
        estadisticas_basico=estadisticas_basico,
        estadisticas_superior=estadisticas_superior,
        pendientes=pendientes
    )