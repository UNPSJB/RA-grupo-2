from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.informe_catedra_completado import schemas, services, models
from typing import List
from src.asociaciones.models import Periodo

router = APIRouter(prefix="/informe-catedra-completado", tags=["informes-catedra-completados"])

@router.get("/docente/{docente_id}/pendientes", response_model=List[schemas.InformePendiente])
def listar_informes_pendientes(docente_id: int, anio: int, periodo: Periodo, db: Session = Depends(get_db)):
    return services.obtener_informes_pendientes(db, docente_id, anio, periodo)

@router.get("/existe")
def verificar_informe_catedra_completado(docente_materia_id: int, db: Session = Depends(get_db)):
    existe = services.verificar_informe_existente(db, docente_materia_id)
    return {"existe": existe}

@router.post("/", response_model=schemas.InformeCatedraCompletado)
def crear_informe_catedra_completado(
    informe: schemas.InformeCatedraCompletadoConRespuestasCreate, 
    db: Session = Depends(get_db) 
):
    return services.crear_informe_completado(db, informe)

@router.get("/{informe_id}", response_model=schemas.InformeCatedraCompletado)
def obtener_informe_catedra_completado(informe_id: int, db: Session = Depends(get_db)):
    return services.obtener_informe_completado(db, informe_id)


@router.get("/departamento/{departamento_id}", response_model=List[schemas.InformeCatedraCompletado])
def obtener_informes_por_departamento(departamento_id: int, db: Session = Depends(get_db)):
    return services.obtener_informes_por_departamento(db, departamento_id)