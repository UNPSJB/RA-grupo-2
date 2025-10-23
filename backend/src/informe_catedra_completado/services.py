from sqlalchemy import select
from sqlalchemy.orm import Session
from src.informe_catedra_completado import models, schemas, exceptions
from src.asociaciones.docente_materia.models import DocenteMateria
from src.informe_catedra_completado.models import InformeCatedraCompletado
from src.materias.models import Materia

def crear_informe_catedra(db: Session, informe: schemas.InformeCatedraCompletadoCreate):
    relacion = db.scalar(select(DocenteMateria).where(DocenteMateria.id == informe.docente_materia_id))
    if relacion is None:
        raise exceptions.DocenteMateriaNoEncontrada()
    existente = db.scalar(
        select(models.InformeCatedraCompletado).where(
            models.InformeCatedraCompletado.docente_materia_id == informe.docente_materia_id,
            models.InformeCatedraCompletado.anio == informe.anio,
            models.InformeCatedraCompletado.periodo == informe.periodo
        )
    )
    if existente is not None:
        raise exceptions.InformeYaExiste()
    
    if not informe.contenido or not informe.contenido.strip():
        raise exceptions.InformeContenidoInvalido()
    db_informe = models.InformeCatedraCompletado(**informe.dict())
    db.add(db_informe)
    db.commit()
    db.refresh(db_informe)
    return db_informe

def get_informe(db: Session, informe_id: int):
    informe = db.query(models.InformeCatedraCompletado).filter(models.InformeCatedraCompletado.id == informe_id).first()
    if informe is None:
        raise exceptions.InformeNoEncontrado()
    return informe
def get_informes(db: Session):
    return db.query(models.InformeCatedraCompletado).all()

def get_informes_departamento(db: Session, departamento_id: int):
    informes = db.query(InformeCatedraCompletado).join(InformeCatedraCompletado.docente_materia)\
        .join(DocenteMateria.materia)\
        .filter(Materia.departamento_id == departamento_id)\
        .all()
    return informes

