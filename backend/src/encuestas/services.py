from typing import List
from sqlalchemy import delete, select, update, insert
from sqlalchemy.orm import Session
from src.encuestas.models import Encuesta
from src.encuestas import schemas, exceptions
from src.categorias import schemas as categoria_schemas
from src.preguntas import schemas as pregunta_schemas

# operaciones para Encuesta

def leer_encuesta(db: Session, encuesta_id: int) -> schemas.Encuesta:
    db_encuesta = db.scalar(select(Encuesta).where(Encuesta.id == encuesta_id))
    if db_encuesta is None:
        raise exceptions.EncuestaNoEncontrada()
    return db_encuesta

def listar_categorias_encuesta(db: Session, encuesta_id: int) -> List[categoria_schemas.Categoria]:
    db_encuesta = db.scalar(select(Encuesta).where(Encuesta.id == encuesta_id))
    if db_encuesta is None:
        raise exceptions.EncuestaNoEncontrada()
    return db_encuesta.categorias
'''
def listar_preguntas_encuesta(db: Session, encuesta_id: int) -> List[pregunta_schemas.Pregunta]:
    db_encuesta = db.scalar(select(Encuesta).where(Encuesta.id == encuesta_id))
    if db_encuesta is None:
        raise exceptions.EncuestaNoEncontrada()
    return db_encuesta.preguntas
'''