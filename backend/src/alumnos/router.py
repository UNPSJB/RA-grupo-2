from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.alumnos import schemas, services
from src.encuestas import schemas as encuestas_schemas
from src.asociaciones.models import Periodo  # <-- CORRECCIÓN 1: Importar Periodo

router = APIRouter(prefix="/alumnos", tags=["alumnos"])

# Rutas para alumnos

@router.get("/{alumno_id}/encuestas_disponibles", response_model=list[encuestas_schemas.EncuestaDisponible])
def read_encuestas(alumno_id: int, db: Session = Depends(get_db)):
    return services.listar_encuestas_disponibles(db, alumno_id)

@router.get("/materia/{materia_id}/cursantes", response_model=list[schemas.Alumno])
def obtener_alumnos_por_materia_y_periodo(materia_id: int, anio: int, periodo: Periodo, db: Session = Depends(get_db)):
    return services.obtener_alumnos_por_materia_y_periodo(db, materia_id, anio, periodo)
