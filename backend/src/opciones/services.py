from typing import List
from sqlalchemy import delete, select, update, insert
from sqlalchemy.orm import Session
from src.opciones.models import Opcion
from src.opciones import schemas, exceptions

# operaciones para Opcion

def crear_opcion(db: Session, opcion: schemas.OpcionCreate) -> schemas.Opcion:
    _opcion = Opcion(**opcion.model_dump())
    db.add(_opcion)
    db.commit()
    db.refresh(_opcion)
    return _opcion

def leer_opcion(db: Session, opcion_id: int) -> schemas.Opcion:
    db_opcion = db.scalar(select(Opcion).where(Opcion.id == opcion_id))
    if db_opcion is None:
        raise exceptions.OpcionNoEncontrada()
    return db_opcion

def listar_opciones(db: Session) -> List[schemas.Opcion]:
    return db.scalars(select(Opcion)).all()   


