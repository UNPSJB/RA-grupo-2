from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.categorias import schemas, services

router = APIRouter(prefix="/categorias", tags=["categorias"])

# Rutas para categorias

@router.post("/", response_model=schemas.Categoria)
def create_categoria(categoria: schemas.CategoriaCreate, db: Session = Depends(get_db)):
    return services.crear_categoria(db, categoria)

@router.get("/", response_model=list[schemas.Categoria])
def read_categorias(db: Session = Depends(get_db)):
    return services.listar_categorias(db)


@router.get("/{categoria_id}", response_model=schemas.Categoria)
def read_categoria(categoria_id: int, db: Session = Depends(get_db)):
    return services.leer_categoria(db, categoria_id)
