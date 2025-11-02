from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.informe_sintetico_base import schemas, services, exceptions
from src.database import get_db
from typing import List

router = APIRouter(prefix="/informes_sinteticos_base", tags=["informes_sinteticos_base"])

@router.post("/", response_model=schemas.InformeSinteticoBase, status_code=status.HTTP_201_CREATED)
def crear_informe_sintetico_base_route(informe: schemas.InformeSinteticoBaseCreate, db: Session = Depends(get_db)):
    return services.crear_informe_sintetico_base(db, informe)

@router.get("/", response_model=List[schemas.InformeSinteticoBase])
def get_informes_sinteticos_base_route(db: Session = Depends(get_db)):
    return services.get_informes_sinteticos_base(db)

@router.get("/{informe_id}", response_model=schemas.InformeSinteticoBase)
def get_informe_sintetico_base_route(informe_id: int, db: Session = Depends(get_db)):
    try:
        return services.get_informe_sintetico_base(db, informe_id)
    except exceptions.InformeSinteticoBaseNoEncontrado:
        raise HTTPException(status_code=404, detail="Informe Base no encontrado")