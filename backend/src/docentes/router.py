
from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session
from src.database import get_db
from src.docentes import schemas, services

router = APIRouter(prefix="/docentes", tags=["docentes"])


@router.get("/", response_model=List[schemas.Docente])
def read_docentes(db: Session = Depends(get_db)):
    return services.listar_docentes(db)

@router.get("/{docente_id}", response_model=schemas.Docente)
def read_docente(docente_id: int, db: Session = Depends(get_db)):
    docente = services.leer_docente(db, docente_id)
    return docente

@router.post("/{docente_id}/materias/{materia_id}")
def asignar_materia_docente(docente_id: int, materia_id: int, db: Session = Depends(get_db)):
    resultado = services.asignar_materia(db, docente_id, materia_id)
    
    if not resultado:
        return {"error": "Docente o materia no encontrados"}
    
    return {"mensaje": "Materia asignada correctamente"}
@router.get("/{docente_id}/materias")
def obtener_materias_docente(docente_id: int, db: Session = Depends(get_db)):
    materias = services.ver_materias_docente(db, docente_id)
    docente = services.leer_docente(db, docente_id)
    if materias is None:
        return {"error": "Docente no encontrado"}
    
    return {"docente_id": docente_id,"nombre": docente.nombre,"apellido": docente.apellido,"materias": materias}
