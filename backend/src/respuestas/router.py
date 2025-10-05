from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.respuestas import schemas, services

router = APIRouter(prefix="/respuestas", tags=["respuestas"])

@router.post("/{encuesta_completada_id}/lote", response_model=list[schemas.Respuesta])
def crear_respuestas_lote(encuesta_completada_id: int, respuestas: list[schemas.RespuestaCreate], db: Session = Depends(get_db)):
    return services.guardar_varias_respuestas(db, encuesta_completada_id, respuestas)

@router.post("/{encuesta_completada_id}", response_model=schemas.Respuesta)
def crear_respuesta(encuesta_completada_id: int, respuesta: schemas.RespuestaCreate, db: Session = Depends(get_db)):
    return services.guardar_respuesta(db, encuesta_completada_id, respuesta)