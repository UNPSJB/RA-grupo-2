from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.preguntas import schemas, services

router = APIRouter(prefix="/preguntas", tags=["preguntas"])

# Rutas para preguntas

@router.post("/", response_model=schemas.PreguntaCerrada)
def create_pregunta_cerrada(pregunta: schemas.PreguntaCerradaCreate, db: Session = Depends(get_db)):
    return services.crear_pregunta_cerrada(db, pregunta)

@router.get("/", response_model=list[schemas.Pregunta])
def read_preguntas(db: Session = Depends(get_db)):
    return services.listar_preguntas(db)


@router.get("/{pregunta_id}", response_model=schemas.Pregunta)
def read_pregunta(pregunta_id: int, db: Session = Depends(get_db)):
    return services.leer_pregunta(db, pregunta_id)

@router.get("/{pregunta_id}/opciones", response_model=list[schemas.Opcion])
def read_opciones_pregunta(pregunta_id: int, db: Session = Depends(get_db)):
    return services.listar_opciones_pregunta(db, pregunta_id)