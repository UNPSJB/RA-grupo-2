from typing import List
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select
from src.encuestaCompletada import models, schemas, exceptions
from src.encuestaCompletada.models import EncuestaCompletada
from src.respuestas import services as respuestas_services
from src.asociaciones.models import Periodo

def crear_encuesta_completada(db: Session, encuesta_data: schemas.EncuestaCompletadaCreate) -> schemas.EncuestaCompletada:
    encuesta_db = models.EncuestaCompletada(**encuesta_data.model_dump())
    db.add(encuesta_db)
    db.commit()
    db.refresh(encuesta_db)
    return encuesta_db

def obtener_encuesta_completada(db: Session, encuesta_completada_id: int) -> schemas.EncuestaCompletada:
    db_encuesta = db.scalar(
        select(EncuestaCompletada)
        .options(
            joinedload(EncuestaCompletada.materia),
            joinedload(EncuestaCompletada.encuesta),
            joinedload(EncuestaCompletada.respuestas)
            
        )
        .where(EncuestaCompletada.id == encuesta_completada_id)
    )
    if db_encuesta is None:
        raise exceptions.EncuestaCompletadaNoEncontrada()
    return db_encuesta

def obtener_encuestas_por_alumno(db: Session, alumno_id: int) -> List[schemas.EncuestaCompletada]:
    return db.scalars(
        select(EncuestaCompletada)
        .where(EncuestaCompletada.alumno_id == alumno_id)
        .options(
            joinedload(EncuestaCompletada.materia),
            joinedload(EncuestaCompletada.encuesta),
            joinedload(EncuestaCompletada.respuestas)

        )
    ).unique().all()

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

    # guarda las respuestas asociadas (usa tu servicio existente)
    respuestas_services.guardar_respuestas_lote(db, encuesta_db.id, encuesta_data.respuestas)
    return obtener_encuesta_completada(db, encuesta_db.id)

def verificar_encuesta_existente(db: Session, alumno_id: int, encuesta_id: int, materia_id: int, anio: int, periodo: Periodo) -> bool:
    encuesta = db.scalar(
        select(EncuestaCompletada)
        .where(EncuestaCompletada.alumno_id == alumno_id)
        .where(EncuestaCompletada.encuesta_id == encuesta_id)
        .where(EncuestaCompletada.materia_id == materia_id)
        .where(EncuestaCompletada.anio == anio)
        .where(EncuestaCompletada.periodo == periodo)
    )
    return encuesta is not None

