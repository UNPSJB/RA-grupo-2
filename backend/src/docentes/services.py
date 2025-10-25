from typing import List
from sqlalchemy import delete, select, update
from sqlalchemy.orm import Session
from . import models, schemas, exceptions
#from src.materias.services import leer_materia
from src.materias.models import Materia 
from src.asociaciones.docente_materia.models import DocenteMateria

def listar_docentes(db: Session) -> List[schemas.Docente]:
    return db.scalars(select(models.Docente)).all()

def leer_docente(db: Session, docente_id: int) -> schemas.Docente:
   
    db_docente = db.scalar(select(models.Docente).where(models.Docente.id == docente_id))
    if db_docente is None:
        raise exceptions.DocenteNoEncontrado()
    return db_docente


def asignar_materia(db: Session, docente_id: int, materia_id: int, periodo):
    #verifica docente y materia
    docente = db.scalar(select(models.Docente).where(models.Docente.id == docente_id))
    materia = db.scalar(select(Materia).where(Materia.id == materia_id))
    if not docente or not materia:
        return None

    #crea relación en tabla intermedia
    rel = DocenteMateria(docente_id=docente_id, materia_id=materia_id, periodo=periodo)
    db.add(rel)
    db.commit()
    db.refresh(rel)
    return rel

def ver_materias_docente(db: Session, docente_id: int):
    relaciones = db.scalars(
        select(DocenteMateria).where(DocenteMateria.docente_id == docente_id)
    ).all()

    return [
        {
            "id": r.materia.id,
            "nombre": r.materia.nombre,
            "matricula": r.materia.matricula,
            "periodo": r.periodo.name
        } 
        for r in relaciones
    ]
