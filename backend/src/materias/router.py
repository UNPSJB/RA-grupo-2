from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.materias import schemas, services

router = APIRouter(prefix="/materias", tags=["materias"])

@router.get("/", response_model=list[schemas.Materia])
def read_materia(db: Session = Depends(get_db)):
    return services.listar_materia(db)

@router.get("/{materia_id}", response_model=schemas.Materia)
def read_materia(materia_id: int, db: Session = Depends(get_db)):
    materia = services.leer_materia(db, materia_id)
    return materia
