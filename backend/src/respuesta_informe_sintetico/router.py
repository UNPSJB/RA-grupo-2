from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from src.database import get_db
from src.respuesta_informe_sintetico import schemas, services
from src.users import schemas as user_schemas
from src.auth.dependencies import tiene_rol_departamento

router = APIRouter(prefix="/respuestas-informe-sintetico", tags=["respuestas-informe-sintetico"])

@router.post("/", response_model=schemas.RespuestaInformeSintetico, status_code=status.HTTP_201_CREATED)
def crear_respuesta_informe_sintetico(
    respuesta: schemas.RespuestaInformeSinteticoCreate,  
    db: Session = Depends(get_db),
    user: user_schemas.User = Depends(tiene_rol_departamento)
):
    try:
        return services.guardar_respuesta(db, respuesta)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al guardar respuesta: {str(e)}")

@router.post("/lote", response_model=list[schemas.RespuestaInformeSintetico])
def crear_respuestas_informe_sintetico_lote(
    respuestas: list[schemas.RespuestaInformeSinteticoCreate], 
    db: Session = Depends(get_db),
    user: user_schemas.User = Depends(tiene_rol_departamento)
):
    try:
        return services.guardar_respuestas_lote(db, respuestas)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al guardar respuestas en lote: {str(e)}")