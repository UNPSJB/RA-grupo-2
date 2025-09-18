from typing import List
from sqlalchemy import delete, select, update
from sqlalchemy.orm import Session
from . import models, schemas, exceptions
from src.materias.services import leer_materia
from src.materias.models import Materia 

def listar_docentes(db: Session) -> List[schemas.Docente]:
    return db.scalars(select(models.Docente)).all()

def leer_docente(db: Session, docente_id: int) -> schemas.Docente:
   
    db_docente = db.scalar(select(models.Docente).where(models.Docente.id == docente_id))
    if db_docente is None:
        raise exceptions.DocenteNoEncontrado()
    return db_docente

def asignar_materia(db: Session, docente_id: int, materia_id: int):
    #busca docente
    docente = db.scalar(select(models.Docente).where(models.Docente.id == docente_id))
    if not docente:
        return None
    
    #busca materia 
    materia = leer_materia(db, materia_id)
    if not materia:
        return None
    
    #asigna el docente a la materia 
    materia.docente_id = docente_id
    db.commit()
    db.refresh(materia)
    
    return docente

def ver_materias_docente(db: Session, docente_id: int):
    docente = db.scalar(select(models.Docente).where(models.Docente.id == docente_id))
    if not docente:
        return None
    
    # usar Materia importada desde src.materias.models
    materias = db.scalars(select(Materia).where(Materia.docente_id == docente_id)).all()
    
    return [
        {"id": m.id, "nombre": m.nombre, "matricula": m.matricula}
        for m in materias
    ]
