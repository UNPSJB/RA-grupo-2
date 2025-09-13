from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.alumnos import schemas, services
from src.materias import schemas as materias_schemas

router = APIRouter(prefix="/alumnos", tags=["alumnos"])

# Rutas para alumnos

@router.get("/{alumno_id}/encuestas_disponibles", response_model=list[materias_schemas.Materia])
def read_encuestas(alumno_id: int, db: Session = Depends(get_db)):
    return services.listar_encuestas_disponibles(db, alumno_id)

