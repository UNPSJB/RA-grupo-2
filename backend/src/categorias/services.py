from typing import List
from sqlalchemy import delete, select, update, insert
from sqlalchemy.orm import Session
from src.categorias.models import Categoria
from src.categorias import schemas, exceptions

def crear_categoria(db: Session, categoria: schemas.CategoriaCreate) -> schemas.Categoria:
    db_categoria = Categoria(**categoria.model_dump())
    db.add(db_categoria)
    db.commit()
    db.refresh(db_categoria)
    return db_categoria

def leer_categoria(db: Session, categoria_id: int) -> schemas.Categoria:
    db_categoria = db.scalar(select(Categoria).where(Categoria.id == categoria_id))
    if db_categoria is None:
        raise exceptions.CategoriaNoEncontrada()
    return db_categoria

def listar_categorias(db: Session) -> List[schemas.Categoria]:
    return db.scalars(select(Categoria)).all()