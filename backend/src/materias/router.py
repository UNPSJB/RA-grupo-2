from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database import get_db
from src.materias import schemas, services
from src.users import schemas as user_schemas
from src.auth.dependencies import tiene_rol_secretaria

router = APIRouter(prefix="/materias", tags=["materias"])

@router.get("/", response_model=list[schemas.Materia])
def read_materia(db: Session = Depends(get_db)):
    return services.listar_materia(db)

@router.get("/{materia_id}", response_model=schemas.Materia)
def read_materia(materia_id: int, db: Session = Depends(get_db)):
    materia = services.leer_materia(db, materia_id)
    return materia

@router.patch("/asignar-formularios/", status_code=200)
def asignar_formularios_a_materias(
    data: schemas.MateriasAsignarFormularios, 
    db: Session = Depends(get_db),
    user: user_schemas.User = Depends(tiene_rol_secretaria)
):
    if not data.materia_ids:
        raise HTTPException(status_code=400, detail="No se seleccionaron materias")
    
    if data.encuesta_id is None and data.informe_catedra_id is None:
         raise HTTPException(status_code=400, detail="No se especificó ningún formulario para asignar")
        
    filas_actualizadas = services.actualizar_materias_formularios(db=db, data=data)

    return {
        "message": f"Se actualizaron {filas_actualizadas} materias correctamente."
    }