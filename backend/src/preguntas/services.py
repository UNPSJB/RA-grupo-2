from typing import List
from sqlalchemy import delete, select, update, insert
from sqlalchemy.orm import Session
from src.preguntas.models import Pregunta
from src.preguntas import schemas, exceptions
from src.opciones.models import Opcion
from src.opciones import schemas as opcion_schemas

# operaciones para Pregunta

def crear_pregunta_cerrada(db: Session, pregunta: schemas.PreguntaCerradaCreate) -> schemas.PreguntaCerrada:
    _pregunta = Pregunta(
        enunciado=pregunta.enunciado,
        categoria_id=pregunta.categoria_id,
    )
    db.add(_pregunta)
    db.commit()
    db.refresh(_pregunta)

    opciones_existentes = db.query(Opcion).filter(Opcion.id.in_(pregunta.opcion_ids)).all()
    if not opciones_existentes:
        raise ValueError("No se encontraron las opciones seleccionadas")

    _pregunta.opciones = opciones_existentes
    db.commit()
    db.refresh(_pregunta)

    return _pregunta


def leer_pregunta(db: Session, pregunta_id: int) -> schemas.Pregunta:
    db_pregunta = db.scalar(select(Pregunta).where(Pregunta.id == pregunta_id))
    if db_pregunta is None:
        raise exceptions.PreguntaNoEncontrada()
    return db_pregunta

def listar_preguntas(db: Session) -> List[schemas.Pregunta]:
    return db.scalars(select(Pregunta)).all()   

def listar_opciones_pregunta(db: Session, pregunta_id: int) -> List[opcion_schemas.Opcion]:
    pregunta = db.scalar(select(Pregunta).where(Pregunta.id == pregunta_id))
    if pregunta is None:
        raise exceptions.PreguntaNoEncontrada()
    return pregunta.opciones