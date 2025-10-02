from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.opciones import schemas, services

router = APIRouter(prefix="/opciones", tags=["opciones"])

# Rutas para opciones

@router.post("/", response_model=schemas.Opcion)
def create_opcion(opcion: schemas.OpcionCreate, db: Session = Depends(get_db)):
    return services.crear_opcion(db, opcion)

@router.get("/", response_model=list[schemas.Opcion])
def read_opciones(db: Session = Depends(get_db)):
    return services.listar_opciones(db)


@router.get("/{opcion_id}", response_model=schemas.Opcion)
def read_opcion(opcion_id: int, db: Session = Depends(get_db)):
    return services.leer_opcion(db, opcion_id)
