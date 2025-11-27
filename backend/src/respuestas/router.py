from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.respuestas import schemas, services
from src.users import schemas as user_schemas
from src.auth.dependencies import tiene_rol_alumno

router = APIRouter(prefix="/respuestas", tags=["respuestas"])

@router.post("/{encuesta_completada_id}/lote", response_model=list[schemas.Respuesta])
def crear_respuestas_lote(respuestas: list[schemas.RespuestaCreate], db: Session = Depends(get_db), user: user_schemas.User = Depends(tiene_rol_alumno)):
    return services.guardar_respuestas_lote(db, respuestas)

@router.post("/{encuesta_completada_id}", response_model=schemas.Respuesta)
def crear_respuesta(respuesta: schemas.RespuestaCreate, db: Session = Depends(get_db), user: user_schemas.User = Depends(tiene_rol_alumno)):
    return services.guardar_respuesta(db, respuesta)