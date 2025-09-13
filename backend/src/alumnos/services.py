from typing import List
from sqlalchemy import delete, select, update, insert
from sqlalchemy.orm import Session
from src.alumnos.models import Alumno
from src.asociaciones.models import alumno_materia
from src.materias.models import Materia
from src.alumnos import schemas, exceptions
from src.materias import schemas as materia_schemas

# operaciones para Alumno

def leer_alumno(db: Session, alumno_id: int) -> schemas.Alumno:
    db_alumno = db.scalar(select(Alumno).where(Alumno.id == alumno_id))
    if db_alumno is None:
        raise exceptions.AlumnoNoEncontrado()
    return db_alumno

def listar_encuestas_disponibles( db: Session, alumno_id: int) -> List[materia_schemas.Materia]: 
    #stmt = ( 
    #    select(Materia) 
    #    .join(alumno_materia, Materia.id == alumno_materia.c.materia_id) 
    #    .where(alumno_materia.c.alumno_id == alumno_id) ) 
    #print(stmt)
    #print(db.execute(stmt).all())
    #return db.scalars(stmt).all()
    alumno = db.get(Alumno, alumno_id)
    if not alumno:
        return []
    return alumno.materias

   