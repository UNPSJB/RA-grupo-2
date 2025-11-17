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

def actualizar_materias_formularios(
    db: Session, 
    data: schemas.MateriasAsignarFormularios
) -> int:
    
    valores_a_actualizar = {}
    if data.encuesta_id is not None:
        valores_a_actualizar["encuesta_id"] = data.encuesta_id
    
    if data.informe_catedra_id is not None:
        valores_a_actualizar["informe_catedra_id"] = data.informe_catedra_id

    if not valores_a_actualizar:
        return 0 

    query = (
        update(Materia)
        .where(Materia.id.in_(data.materia_ids))
        .values(**valores_a_actualizar)
    )
    
    result = db.execute(query)
    db.commit()

    return result.rowcount