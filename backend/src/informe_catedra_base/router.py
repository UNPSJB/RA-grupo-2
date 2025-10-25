from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.informe_catedra_base import schemas, services, exceptions
from src.categorias import schemas as categoria_schemas
from src.database import get_db
from typing import List

router = APIRouter(prefix="/informes_catedra",tags=["informes_catedra_base"]
)

@router.post("/", response_model=schemas.InformeCatedra)
def crear_informe_catedra_base(informe: schemas.InformeCatedraBase, db: Session = Depends(get_db)):
    return services.crear_informe_catedra_base(db, informe)
@router.get("/", response_model=list[schemas.InformeCatedra])
def get_informes_catedra_base(db: Session = Depends(get_db)):
    return services.get_informes_catedra_base(db)
@router.get("/{informe_id}", response_model=schemas.InformeCatedra)
def get_informe_catedra_base(informe_id: int, db: Session = Depends(get_db)):
    try:
        return services.get_informe_catedra_base(db, informe_id)
    except exceptions.InformeCatedraBaseNoEncontrado:
        raise HTTPException(status_code=404, detail="Informe no encontrado")

@router.get("/{informe_id}/categorias", response_model=list[categoria_schemas.Categoria])
def get_categorias_informe_catedra_base(informe_id: int, db: Session = Depends(get_db)):
    try:
        informe = services.get_informe_catedra_base(db, informe_id)
        
        return informe.categorias
    except exceptions.InformeCatedraBaseNoEncontrado:
        raise HTTPException(status_code=404, detail="Informe no encontrado")
'''
@router.get("/{informe_id}/completados", response_model=list[schemas.InformeCatedraCompletado])
def get_informes_catedra_completados(informe_id: int, db: Session = Depends(get_db)):
    try:
        return services.get_informes_catedra_completados(db, informe_id)
    except exceptions.InformeCatedraBaseNoEncontrado:
        raise HTTPException(status_code=404, detail="Informe base no encontrado")
'''

@router.get("/{informe_id}/categorias_con_preguntas", response_model=List[schemas.CategoriaConPreguntas])
def read_categorias_con_preguntas(informe_id: int, db: Session = Depends(get_db)):
    try:
        categorias = services.get_categorias_con_preguntas_por_informe(db, informe_id)
        return categorias
    except exceptions.InformeCatedraBaseNoEncontrado:
        raise HTTPException(status_code=404, detail="Informe base no encontrado")
    except Exception as e:
        print(f"Error inesperado al obtener categorías con preguntas: {e}") 
        raise HTTPException(status_code=500, detail="Error interno del servidor")