from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from src.database import get_db
from src.informe_catedra_completado.models import InformeCatedraCompletado
from src.informe_catedra_completado import services, schemas, exceptions
from src.departamentos import models
router = APIRouter(prefix="/informes_catedra_completado", tags=["informes_catedra_completado"])

@router.post("/", response_model=schemas.InformeCatedraCompletado)
def crear_informe_catedra(informe: schemas.InformeCatedraCompletadoCreate, db: Session = Depends(get_db)):
    try:
        return services.crear_informe_catedra(db, informe)
    except exceptions.DocenteMateriaNoEncontrada:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=exceptions.DocenteMateriaNoEncontrada.DETAIL
        )
    except exceptions.InformeYaExiste:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail= exceptions.InformeYaExiste.DETAIL
        )
    except exceptions.InformeContenidoInvalido:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=exceptions.InformeContenidoInvalido.DETAIL
        )

@router.get("/")
def get_informes(db: Session = Depends(get_db)):
    informes = db.query(InformeCatedraCompletado).all()
    try:
        return informes
    except exceptions.InformeNoEncontrado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=exceptions.InformeNoEncontrado.DETAIL
        )


@router.get("/{id}")
def get_informe(id: int, db: Session = Depends(get_db)):
    informe = db.query(InformeCatedraCompletado).filter(InformeCatedraCompletado.id == id).first()
    try:
        return informe
    except exceptions.InformeNoEncontrado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=exceptions.InformeNoEncontrado.DETAIL
        )
@router.get("/{departamento_id}/informes_catedra", response_model=list[schemas.InformeCatedraCompletado])
def get_informes_departamento(departamento_id: int, db: Session = Depends(get_db)):
    return services.get_informes_departamento(db, departamento_id)
