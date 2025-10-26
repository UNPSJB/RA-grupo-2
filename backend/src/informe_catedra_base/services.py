from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select
from src.informe_catedra_base import models, schemas, exceptions
from src.informe_catedra_completado.models import InformeCatedraCompletado
from src.materias.models import Materia
from src.categorias.models import Categoria
from src.preguntas.models import Pregunta

def crear_informe_catedra_base(db: Session, informe: schemas.InformeCatedraCreate):
    # 1) Crear un único InformeCatedra
    db_informe = models.InformeCatedra(titulo=informe.titulo)
    db.add(db_informe)
    db.flush()  
    '''
    # 2) Asociar materias existentes (validar ids)
    if informe.materias:
        ids = [m.id for m in informe.materias if getattr(m, "id", None)]
        if not ids:
            raise exceptions.InformeCatedraBaseError("Materias inválidas")
        materias_objs = db.query(Materia).filter(Materia.id.in_(ids)).all()
        db_informe.materias = materias_objs

    # 3) Crear y asociar categorías (si vienen)
    if informe.categorias:
        nuevas = []
        for c in informe.categorias:
            # Si c.encuesta_id es 0 -> convertir a None para no romper FK
            encuesta_id = c.encuesta_id or None
            nueva = Categoria(
                cod=c.cod,
                texto=c.texto,
                encuesta_id=encuesta_id,
                informe_base_id=db_informe.id
            )
            nuevas.append(nueva)
            db.add(nueva)
        # db_informe.categorias = nuevas  # opcional, SQLAlchemy lo tomará por backref
    '''
    db.commit()
    db.refresh(db_informe)
    return db_informe

def get_informe_catedra_base(db: Session, informe_id: int):
    informe = db.query(models.InformeCatedra).filter(models.InformeCatedra.id == informe_id).first()
    if informe is None:
        raise exceptions.InformeCatedraBaseNoEncontrado()
    return informe

def get_informes_catedra_base(db: Session):
    return db.query(models.InformeCatedra).all()

def get_informes_catedra_completados(db: Session, informe_id: int):
    informe = db.query(models.InformeCatedra).filter(models.InformeCatedra.id == informe_id).first()
    if not informe:
        raise exceptions.InformeCatedraBaseNoEncontrado()
    informes_por_materia = []
    for materia in informe.materias:
        informe_completado = db.query(InformeCatedraCompletado).filter_by(
            materia_id=materia.id,
            informe_catedra_base_id=informe.id
        ).first()
        if informe_completado:
            informes_por_materia.append(informe_completado)
    return informes_por_materia

def get_categorias_con_preguntas_por_informe(db: Session, informe_id: int):

    informe = get_informe_catedra_base(db, informe_id) 

    stmt = (
        select(Categoria)
        .options(selectinload(Categoria.preguntas)
        .selectinload(Pregunta.opciones) 
        )
        .where(Categoria.informe_base_id == informe_id) 

    )
    categorias_con_preguntas = db.scalars(stmt).unique().all()
    
    return categorias_con_preguntas