from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from src.database import get_db
from src.datosEstadisticos import services, schemas
from typing import List
from src.asociaciones.models import Periodo

router = APIRouter(prefix="/datos_estadisticos", tags=["datos_estadisticos"])

@router.get("/", response_model=List[schemas.DatosEstadisticosPregunta])
def get_datos_estadisticos(id_materia: int, anio: int, periodo: Periodo, db: Session = Depends(get_db)):
    return services.obtener_datos_estadisticos(db, id_materia, anio, periodo)  

@router.post("/guardar_datos/{informe_id}")
def create_guardar_datos_estadisticos(informe_id: int, db: Session = Depends(get_db)):
    services.guardar_datos_estadisticos(db, informe_id)
    return {"message": "Datos estadísticos generados y guardados correctamente."}

@router.get("/recuperar_existentes/{informe_id}", response_model=List[schemas.DatosEstadisticosPregunta])
def get_datos_estadisticos_existentes(informe_id: int, db: Session = Depends(get_db)):
    return services.recuperar_datos_estadisticos(db, informe_id)  

@router.get("/cantidad_encuestas_completadas", response_model=int)
def get_cantidad_encuestas_completadas(id_materia: int, anio: int, periodo: Periodo, db: Session = Depends(get_db)):
    return services.cantidad_encuestas_completadas(db, id_materia, anio, periodo)