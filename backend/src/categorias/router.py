from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.categorias import schemas, services
from src.preguntas import schemas as pregunta_schemas

router = APIRouter(prefix="/categorias", tags=["categorias"])

# Rutas para categorias

@router.post("/paraEncuesta/", response_model=schemas.CategoriaEncuesta)
def create_categoria_encuesta(categoria: schemas.CategoriaEncuestaCreate, db: Session = Depends(get_db)):
    return services.crear_categoria_encuesta(db, categoria)

@router.post("/paraInforme/", response_model=schemas.CategoriaInformeBase)
def create_categoria_informe(categoria: schemas.CategoriaInformeBaseCreate, db: Session = Depends(get_db)):
    return services.crear_categoria_informe(db, categoria)

@router.get("/", response_model=list[schemas.Categoria])
def read_categorias(db: Session = Depends(get_db)):
    return services.listar_categorias(db)


@router.get("/{categoria_id}", response_model=schemas.Categoria)
def read_categoria(categoria_id: int, db: Session = Depends(get_db)):
    return services.leer_categoria(db, categoria_id)

@router.get("/{categoria_id}/preguntas", response_model=list[pregunta_schemas.Pregunta])
def read_preguntas_categoria(categoria_id: int, db: Session = Depends(get_db)):
    return services.listar_preguntas_categoria(db, categoria_id)
