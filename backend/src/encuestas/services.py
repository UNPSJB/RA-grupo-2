from typing import List
from sqlalchemy import delete, select, update, insert
from sqlalchemy.orm import Session
from src.encuestas.models import Encuesta
from src.encuestas import schemas, exceptions
from src.categorias import schemas as categoria_schemas
from src.preguntas import schemas as pregunta_schemas

# operaciones para Encuesta

def crear_encuesta(db: Session, encuesta: schemas.EncuestaCreate) -> schemas.Encuesta:
    db_encuesta = Encuesta(nombre=encuesta.nombre)
    db.add(db_encuesta)
    db.commit()
    db.refresh(db_encuesta)
    return db_encuesta

def leer_encuesta(db: Session, encuesta_id: int) -> schemas.Encuesta:
    db_encuesta = db.scalar(select(Encuesta).where(Encuesta.id == encuesta_id))
    if db_encuesta is None:
        raise exceptions.EncuestaNoEncontrada()
    return db_encuesta

def listar_categorias_encuesta(db: Session, encuesta_id: int) -> List[categoria_schemas.CategoriaEncuesta]:
    db_encuesta = db.scalar(select(Encuesta).where(Encuesta.id == encuesta_id))
    if db_encuesta is None:
        raise exceptions.EncuestaNoEncontrada()
    return db_encuesta.categorias

def listar_preguntas_cerradas_encuesta(db: Session, encuesta_id: int) -> List[pregunta_schemas.Pregunta]:
    db_encuesta = db.scalar(select(Encuesta).where(Encuesta.id == encuesta_id))
    if db_encuesta is None:
        raise exceptions.EncuestaNoEncontrada()
    
    respuestas=[]
    for categoria in db_encuesta.categorias:
        for pregunta in categoria.preguntas:
            if pregunta.tipo == "cerrada":
                respuestas.append(pregunta)

    return respuestas
