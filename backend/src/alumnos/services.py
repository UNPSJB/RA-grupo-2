from typing import List
from sqlalchemy import delete, select, update, insert
from sqlalchemy.orm import Session
from src.alumnos.models import Alumno
from src.asociaciones.models import alumno_materia
from src.encuestas.models import Encuesta
from src.materias.models import Materia
from src.alumnos import schemas, exceptions
from src.materias import schemas as materia_schemas
from datetime import date, timedelta
from src.asociaciones.models import Periodo

# operaciones para Alumno

def leer_alumno(db: Session, alumno_id: int) -> schemas.Alumno:
    db_alumno = db.scalar(select(Alumno).where(Alumno.id == alumno_id))
    if db_alumno is None:
        raise exceptions.AlumnoNoEncontrado()
    return db_alumno

#def listar_encuestas_disponibles( db: Session, alumno_id: int) -> List[materia_schemas.Materia]: 
#    alumno = db.get(Alumno, alumno_id)
#    if not alumno:
#        return []
#    return [m.encuesta for m in alumno.materias if m.encuesta is not None]

#def listar_encuestas_disponibles(db: Session, alumno_id: int):
#    fecha_limite = date.today() - timedelta(days=30)

#    stmt = (
#        select(Encuesta)
#        .join(Materia, Encuesta.id == Materia.encuesta_id)
#        .join(alumno_materia, Materia.id == alumno_materia.c.materia_id)
#        .where(alumno_materia.c.alumno_id == alumno_id)
#        .where(alumno_materia.c.fecha_fin_cursada >= fecha_limite)
#    )

#    return db.scalars(stmt).all()



def listar_encuestas_disponibles(db: Session, alumno_id: int):
    stmt = (
        select(Materia.nombre, Encuesta.nombre, Materia.id, Materia.encuesta_id)
        .join(alumno_materia, alumno_materia.c.materia_id == Materia.id)
        .join(Encuesta, Encuesta.id == Materia.encuesta_id)
        .where(alumno_materia.c.alumno_id == alumno_id)
        .where(alumno_materia.c.anio == 2025)
        .where(alumno_materia.c.periodo == Periodo.PRIMER_CUATRI)
    )

    resultados = db.execute(stmt).all()

    return [{"materia": m, "encuesta": e, "materia_id": materia_id, "encuesta_id": encuesta_id} for m, e, materia_id, encuesta_id in resultados] 

def obtener_alumnos_por_materia_y_periodo(db: Session, materia_id: int, anio: int, periodo: Periodo) -> List[Alumno]:
    stmt = (
        select(Alumno)
        .join(alumno_materia, alumno_materia.c.alumno_id == Alumno.id)
        .where(alumno_materia.c.materia_id == materia_id)
        .where(alumno_materia.c.anio == anio)
        .where(alumno_materia.c.periodo == periodo)
        .distinct()
    )
    return db.scalars(stmt).all()
