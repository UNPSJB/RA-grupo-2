from typing import List
from sqlalchemy import delete, select, update, insert
from sqlalchemy.orm import Session
from src.materias.models import Materia, alumno_materia
from src.materias import schemas, exceptions

# operaciones para Materia

def leer_materia(db: Session, materia_id: int) -> schemas.Materia:
    db_materia = db.scalar(select(Materia).where(Materia.id == materia_id))
    if db_materia is None:
        raise exceptions.MateriaNoEncontrada()
    return db_materia
   