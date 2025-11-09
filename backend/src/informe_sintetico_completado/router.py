from fastapi import APIRouter, HTTPException, Depends,status, Query
from sqlalchemy.orm import Session
from src.database import get_db
from src.informe_sintetico_completado.models import InformeSinteticoCompletado
from src.informe_sintetico_completado import schemas, services
from typing import List
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

@router.get("/tabla_pregunta_2B/")
def get_tabla_pregunta_2B(id_dpto: int, id_carrera: int, anio: int, periodo: str, db: Session = Depends(get_db)):
    try:
        elementos = services.get_elementos_pregunta2B(db, id_dpto, id_carrera, anio, periodo)
        return elementos
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener tabla de pregunta 2B: {str(e)}")

@router.get("/tabla_pregunta_2/", response_model=List[schemas.TablaPregunta2Item])
def get_tabla_porcentaje_horas(
    id_dpto: int = Query(...), 
    id_carrera: int = Query(...), 
    anio: int = Query(...), 
    periodo: str = Query(...),
    db: Session = Depends(get_db)):
    try:
        elementos = services.get_elementos_pregunta2(db, id_dpto, id_carrera, anio, periodo)
        return elementos
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener tabla de porcentaje de horas: {str(e)}")
 
@router.get("/informacion-general/", response_model=List[schemas.InformacionGeneral])
def obtener_informacion_general(
    id_dpto: int,
    id_carrera: int,
    anio: int,
    periodo: str,
    db: Session = Depends(get_db)
):
    try:
        elementos = services.obtener_informacion_general(db, id_dpto, id_carrera, anio, periodo)
        if not elementos:
            raise HTTPException(status_code=404, detail="No se encontraron informes completados para los filtros dados.")
        return elementos
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener información general: {str(e)}")

@router.get("/temas-desarrollados/", response_model=List[schemas.TemasDesarrolladosItem])
def obtener_temas_desarrollados(
    id_dpto: int,
    id_carrera: int,
    anio: int,
    periodo: str,
    db: Session = Depends(get_db)
):
    try:
        elementos = services.obtener_temas_desarrollados(db, id_dpto, id_carrera, anio, periodo)
        return elementos
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener temas desarrollados: {str(e)}")

@router.get("/tabla_pregunta_2C/", response_model=List[schemas.TablaPregunta2CItem])
def get_preguntas_2C(
    id_dpto: int = Query(...),
    id_carrera: int = Query(...),
    anio: int = Query(...),
    periodo: str = Query(...),
    db: Session = Depends(get_db)
):
    try:
        elementos = services.get_elementos_pregunta2C(db, id_dpto, id_carrera, anio, periodo)
        if not elementos:
            raise HTTPException(status_code=404, detail="No se encontraron respuestas de cátedra para la sección 2.C con esos filtros.")
        return elementos
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener respuestas de sección 2C: {str(e)}")
    
@router.get("/bibliografia_equipamiento/", response_model=List[schemas.EquipamientoBibliografia]) # ⬅️ CAMBIO AQUÍ
def get_bibliografia_equipamiento(
    id_dpto: int = Query(...), 
    id_carrera: int = Query(...), 
    anio: int = Query(...), 
    periodo: str = Query(...),
    db: Session = Depends(get_db)):

    try:
        elementos = services.get_bibliografia_equipamiento(db, id_dpto, id_carrera, anio, periodo)
        return elementos
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener bibliografía y equipamiento: {str(e)}")
    

@router.get("/desempeno_auxiliares/", response_model=List[schemas.TablaDesempenoAuxiliar])
def get_desempeno_auxiliares(
    id_dpto: int = Query(...), 
    id_carrera: int = Query(...), 
    anio: int = Query(...), 
    periodo: str = Query(...),
    db: Session = Depends(get_db)):
    try:
        elementos = services.get_desempeno_auxiliares(db, id_dpto, id_carrera, anio, periodo)
        return elementos
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener desempeño de auxiliares: {str(e)}")