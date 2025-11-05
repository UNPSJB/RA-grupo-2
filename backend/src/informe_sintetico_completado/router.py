from fastapi import APIRouter, HTTPException, Depends,status
from sqlalchemy.orm import Session
from src.database import get_db
from src.informe_sintetico_completado.models import InformeSinteticoCompletado
from src.informe_sintetico_completado import schemas, services
router = APIRouter(prefix="/informes_sinteticos_completados", tags=["informes_sinteticos_completados"])

@router.post("/completados/", response_model=schemas.InformeSinteticoCompletado, status_code=status.HTTP_201_CREATED)
def create_informe_completado(
    informe: schemas.InformeSinteticoCompletadoCreate, 
    db: Session = Depends(get_db)
):
    try:
        return services.create_informe_completado(db, informe)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear informe completado: {str(e)}")
@router.get("/completados/")
def get_informes_completados(db: Session = Depends(get_db)):
    try:
        informes = db.query(InformeSinteticoCompletado).all()
        return informes
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener informes completados: {str(e)}")

@router.get("/completados/{id}")
def get_informe_completado(id: int, db: Session = Depends(get_db)):
    try:
        
        informe = db.query(InformeSinteticoCompletado).filter(InformeSinteticoCompletado.id == id).first()
        if not informe:
            raise HTTPException(status_code=404, detail="Informe completado no encontrado")
        return informe
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener informe completado: {str(e)}")
