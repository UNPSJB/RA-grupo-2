from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database import get_db
from . import services, schemas

router = APIRouter(
    prefix="/informes",
    tags=["informes"]
)

@router.get("/", response_model=list[schemas.InformeSintetico])
def listar_informes(db: Session = Depends(get_db)):
    return services.get_informes(db)

@router.get("/{informe_id}", response_model=schemas.InformeSintetico)
def obtener_informe(informe_id: int, db: Session = Depends(get_db)):
    informe = services.get_informe(db, informe_id)
    if not informe:
        raise HTTPException(status_code=404, detail="Informe no encontrado")
    return informe
