from typing import List
from sqlalchemy import delete, select, update, insert, exists, not_
from sqlalchemy.orm import Session
from src.alumnos.models import Alumno
from src.asociaciones.models import alumno_materia
from src.encuestas.models import Encuesta
from src.materias.models import Materia
from src.alumnos import schemas, exceptions
from src.materias import schemas as materia_schemas
from datetime import date, timedelta
from src.asociaciones.models import Periodo
from src.constants import ANIO_ACTUAL,PERIODO_ACTUAL
from src.encuestaCompletada.models import EncuestaCompletada

# operaciones para Alumno

def leer_alumno(db: Session, alumno_id: int) -> schemas.Alumno:
    db_alumno = db.scalar(select(Alumno).where(Alumno.id == alumno_id))
    if db_alumno is None:
        raise exceptions.AlumnoNoEncontrado()
    return db_alumno

def listar_encuestas_disponibles(db: Session, alumno_id: int):
    descarte = (
        select(EncuestaCompletada.id)
        .where(EncuestaCompletada.alumno_id == alumno_id)
        .where(EncuestaCompletada.anio==ANIO_ACTUAL)
        .where(EncuestaCompletada.periodo==PERIODO_ACTUAL)
        .where(EncuestaCompletada.encuesta_id == Encuesta.id)
    )
    stmt = (
        select(Materia.nombre, Encuesta.nombre, Materia.id, Materia.encuesta_id)
        .join(alumno_materia, alumno_materia.c.materia_id == Materia.id)
        .join(Encuesta, Encuesta.id == Materia.encuesta_id)
        .where(alumno_materia.c.alumno_id == alumno_id)
        .where(alumno_materia.c.anio == ANIO_ACTUAL)
        .where(alumno_materia.c.periodo == PERIODO_ACTUAL)
        .where(~exists(descarte))
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
