from sqlalchemy import select
from sqlalchemy.orm import Session
from src.informe_catedra import models, schemas, exceptions
from src.asociaciones.docente_materia.models import DocenteMateria
from src.informe_catedra.models import InformeCatedra
from src.materias.models import Materia

def crear_informe_catedra(db: Session, informe: schemas.InformeCatedraCreate):
    relacion = db.scalar(select(DocenteMateria).where(DocenteMateria.id == informe.docente_materia_id))
    if relacion is None:
        raise exceptions.DocenteMateriaNoEncontrada()
    existente = db.scalar(
        select(models.InformeCatedra).where(
            models.InformeCatedra.docente_materia_id == informe.docente_materia_id,
            models.InformeCatedra.anio == informe.anio,
            models.InformeCatedra.periodo == informe.periodo
        )
    )
    if existente is not None: #None = Vacio 
        raise exceptions.InformeYaExiste()
    if not informe.contenido or not informe.contenido.strip():
        raise exceptions.InformeContenidoInvalido()
    db_informe = models.InformeCatedra(**informe.dict())
    db.add(db_informe)
    db.commit()
    db.refresh(db_informe)
    return db_informe
def get_informe(db: Session, informe_id: int):
    informe = db.query(models.InformeCatedra).filter(models.InformeCatedra.id == informe_id).first()
    if informe is None:
        raise exceptions.InformeNoEncontrado()
    return informe
def get_informes(db: Session):
    return db.query(models.InformeCatedra).all()

def get_informes_departamento(db: Session, departamento_id: int):
    informes = db.query(InformeCatedra).join(InformeCatedra.docente_materia)\
        .join(DocenteMateria.materia)\
        .filter(Materia.departamento_id == departamento_id)\
        .all()
    return informes

