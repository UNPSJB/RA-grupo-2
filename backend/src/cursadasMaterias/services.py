from typing import List
from sqlalchemy import delete, select, update, insert
from sqlalchemy.orm import Session
from src.cursadasMaterias.models import CursadaMateria, alumno_materia
from src.cursadasMaterias import schemas, exceptions

# operaciones para Materia

def leer_cursada(db: Session, materia_id: int) -> schemas.CursadaMateria:
    db_materia = db.scalar(select(CursadaMateria).where(CursadaMateria.id == materia_id))
    if db_materia is None:
        raise exceptions.MateriaNoEncontrada()
    return db_materia
   