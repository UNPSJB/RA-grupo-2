from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.respuestas import schemas, services

router = APIRouter(prefix="/respuestas", tags=["respuestas"])

@router.post("/{encuesta_completada_id}/lote", response_model=list[schemas.Respuesta])
def crear_respuestas_lote(respuestas: list[schemas.RespuestaCreate], db: Session = Depends(get_db)):
    return services.guardar_respuestas_lote(db, respuestas)

@router.post("/{encuesta_completada_id}", response_model=schemas.Respuesta)
def crear_respuesta(respuesta: schemas.RespuestaCreate, db: Session = Depends(get_db)):
    return services.guardar_respuesta(db, respuesta)