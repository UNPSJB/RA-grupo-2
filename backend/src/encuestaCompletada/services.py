from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from src.encuestaCompletada import schemas, models
from src.encuestaCompletada import exceptions
from src.encuestaCompletada.models import EncuestaCompletada
from src.respuestas import schemas as respuestas_schemas

def crear_encuesta_completada(db: Session, encuesta_data: schemas.EncuestaCompletadaCreate) -> schemas.EncuestaCompletada:
    encuesta_db = models.EncuestaCompletada(**encuesta_data.model_dump())
    db.add(encuesta_db)
    db.commit()
    db.refresh(encuesta_db)
    return encuesta_db

def obtener_encuesta_completada(db: Session, encuesta_completada_id: int) -> schemas.EncuestaCompletada:
    db_encuesta_completada = db.scalar(select(EncuestaCompletada).where(EncuestaCompletada.id == encuesta_completada_id))
    if db_encuesta_completada is None:
        raise exceptions.EncuestaCompletadaNoEncontrada()
    return db_encuesta_completada

def obtener_encuestas_por_alumno(db: Session, alumno_id: int) -> List[schemas.EncuestaCompletada]:  
    encuestas = db.scalars(
        select(models.EncuestaCompletada)
        .where(models.EncuestaCompletada.alumno_id == alumno_id) 
        .options(joinedload(models.EncuestaCompletada.respuestas))
    ).unique().all()
    return encuestas


def crear_encuesta_completa_con_respuestas(db: Session, encuesta_data: schemas.EncuestaCompletadaConRespuestasCreate):
    encuesta_db = models.EncuestaCompletada(
        alumno_id=encuesta_data.alumno_id, 
        encuesta_id=encuesta_data.encuesta_id,
        materia_id=encuesta_data.materia_id,
        anio=encuesta_data.anio,
        periodo=encuesta_data.periodo
    )
    db.add(encuesta_db)
    db.commit()
    db.refresh(encuesta_db)
    
    from src.respuestas import services as respuestas_services
    respuestas_services.guardar_respuestas_lote(db, encuesta_db.id, encuesta_data.respuestas)
    
    return obtener_encuesta_completada(db, encuesta_db.id)

