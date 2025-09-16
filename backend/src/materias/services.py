from typing import List
from sqlalchemy import delete, select, update
from sqlalchemy.orm import Session
from src.materias.models import Materia
from src.materias import schemas, exceptions 


def listar_materia(db: Session) -> List[schemas.Materia]:
    return db.scalars(select(Materia)).all()

def leer_materia(db: Session, materia_id: int) -> schemas.Materia:
    db_materia = db.scalar(select(Materia).where(Materia.id == materia_id))
    if db_materia is None:
        raise exceptions.MateriaNoEncontrada()
    return db_materia

