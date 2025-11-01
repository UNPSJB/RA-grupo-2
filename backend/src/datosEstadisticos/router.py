from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from src.database import get_db
from src.datosEstadisticos import services, schemas
from typing import List
from src.asociaciones.models import Periodo

router = APIRouter(prefix="/datos_estadisticos", tags=["datos_estadisticos"])

@router.get("/", response_model=List[schemas.DatosEstadisticosCategoria])
def get_datos_estadisticos(id_materia: int, anio: int, periodo: Periodo, db: Session = Depends(get_db)):
    return services.obtener_datos_estadisticos(db, id_materia, anio, periodo)

@router.get("/cantidad_encuestas_completadas", response_model=int)
def get_cantidad_encuestas_completadas(id_materia: int, anio: int, periodo: Periodo, db: Session = Depends(get_db)):
    return services.cantidad_encuestas_completadas(db, id_materia, anio, periodo)


@router.get("/respuestas_abiertas", response_model=List[schemas.DatosAbiertosCategoria])
def obtener_respuestas_abiertas(
    id_materia: int,
    anio: int,
    periodo: Periodo,
    db: Session = Depends(get_db)
):
    """
    Devuelve todas las respuestas abiertas de la categoría G
    agrupadas por pregunta, para una materia dada.
    """
    return services.obtener_respuestas_abiertas_por_materia(db, id_materia, anio, periodo)