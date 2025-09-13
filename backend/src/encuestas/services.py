from typing import List
from sqlalchemy import delete, select, update, insert
from sqlalchemy.orm import Session
from src.encuestas.models import Encuesta
from src.encuestas import schemas, exceptions

# operaciones para Encuesta

def leer_encuesta(db: Session, encuesta_id: int) -> schemas.Encuesta:
    db_encuesta = db.scalar(select(Encuesta).where(Encuesta.id == encuesta_id))
    if db_encuesta is None:
        raise exceptions.EncuestaNoEncontrada()
    return db_encuesta
   