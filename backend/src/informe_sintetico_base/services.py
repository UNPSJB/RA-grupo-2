from sqlalchemy.orm import Session
from sqlalchemy import select
from src.informe_sintetico_base import models, schemas, exceptions
from typing import List

def crear_informe_sintetico_base(db: Session, informe: schemas.InformeSinteticoBaseCreate) -> models.InformeSinteticoBase:
    db_informe = models.InformeSinteticoBase(**informe.model_dump())
    db.add(db_informe)
    db.commit()
    db.refresh(db_informe)
    return db_informe

def get_informe_sintetico_base(db: Session, informe_id: int) -> models.InformeSinteticoBase:
    informe = db.scalar(select(models.InformeSinteticoBase).where(models.InformeSinteticoBase.id == informe_id))
    if informe is None:
        raise exceptions.InformeSinteticoBaseNoEncontrado()
    return informe

def get_informes_sinteticos_base(db: Session) -> List[models.InformeSinteticoBase]:
    return db.scalars(select(models.InformeSinteticoBase)).all()