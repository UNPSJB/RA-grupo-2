from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.encuestas import schemas, services
from src.categorias import schemas as categoria_schemas
from src.preguntas import schemas as pregunta_schemas

router = APIRouter(prefix="/encuestas", tags=["encuestas"])

# Rutas para encuestas

@router.get("/{encuesta_id}", response_model=schemas.Encuesta)
def read_encuesta(encuesta_id: int, db: Session = Depends(get_db)):
    return services.leer_encuesta(db, encuesta_id)  

@router.get("/{encuesta_id}/categorias", response_model=list[categoria_schemas.CategoriaEncuesta])
def read_categorias_encuesta(encuesta_id: int, db: Session = Depends(get_db)):
    return services.listar_categorias_encuesta(db, encuesta_id)

@router.get("/{encuesta_id}/preguntas", response_model=list[pregunta_schemas.Pregunta])
def read_preguntas_encuesta(encuesta_id: int, db: Session = Depends(get_db)):
    return services.listar_preguntas_encuesta(db, encuesta_id)