from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from src.database import get_db
from src.informeCatedraCompletado import services, schemas
from typing import List
from src.asociaciones.models import Periodo

router = APIRouter(prefix="/informes_catedra_completados", tags=["informes_catedra_completados"])

@router.get("/datos_stadisticos/{informe_id}", response_model=List[schemas.DatosEstadisticosPregunta])
def get_datos_estadisticos(id_materia: int, anio: int, periodo: Periodo, db: Session = Depends(get_db)):
    return services.obtener_datos_estadisticos(db, id_materia, anio, periodo)  

@router.post("/{informe_id}/guardar_datos_estadisticos")
def create_guardar_datos_estadisticos(informe_id: int, db: Session = Depends(get_db)):
    services.guardar_datos_estadisticos(db, informe_id)
    return {"message": "Datos estadísticos generados y guardados correctamente."}

@router.get("/datos_estadisticos_existentes/{informe_id}", response_model=List[schemas.DatosEstadisticosPregunta])
def get_datos_estadisticos_existentes(id_informe_catedra_completado: int, db: Session = Depends(get_db)):
    return services.recuperar_datos_estadisticos(db, id_informe_catedra_completado)  
