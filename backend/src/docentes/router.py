from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select 
from typing import List
from src.database import get_db
from src.asociaciones.models import Periodo
from src.docentes import schemas
from src.materias import schemas as materia_schemas
from src.docentes import models as docente_models
from src.asociaciones.docente_materia.models import DocenteMateria
from src.materias.models import Materia
from src.informe_catedra_completado.models import InformeCatedraCompletado
from src.docentes import services
from src.docentes import services as docente_services
from src.datosEstadisticos import services as estadisticas_services
from src.informe_catedra_completado import services as informe_services

router = APIRouter(prefix="/docentes", tags=["docentes"])

@router.get("/", response_model=List[schemas.Docente])
def read_docentes(db: Session = Depends(get_db)):
    return services.listar_docentes(db)

@router.get("/{docente_id}", response_model=schemas.Docente)
def read_docente(docente_id: int, db: Session = Depends(get_db)):
    docente = services.leer_docente(db, docente_id)
    return docente

@router.post("/{docente_id}/materias/{materia_id}")
def asignar_materia_docente(docente_id: int, materia_id: int, periodo: Periodo, db: Session = Depends(get_db)):
    resultado = services.asignar_materia(db, docente_id, materia_id, periodo)
    if not resultado:
        return {"error": "Docente o materia no encontrados"}
    return {"mensaje": "Materia asignada correctamente"}

@router.get("/{docente_id}/materias")
def obtener_materias_docente(docente_id: int, db: Session = Depends(get_db)):
    docente = services.leer_docente(db, docente_id)
    if not docente:
        return {"error": "Docente no encontrado"}
    
    materias = services.ver_materias_docente(db, docente_id)
    return {
        "docente_id": docente.id,
        "nombre": docente.nombre,
        "apellido": docente.apellido,
        "materias": materias
    }
    
@router.get("/materia_relacion/{relacion_id}")
def obtener_relacion(relacion_id: int, db: Session = Depends(get_db)):
    relacion = docente_services.obtener_relacion_docente_materia(db, relacion_id)
    if not relacion:
        return {"error": "Relación no encontrada"}
    return {
        "relacion_id": relacion.id,
        "docente_id": relacion.docente_id,
        "materia_id": relacion.materia_id,
        "anio": relacion.anio,
        "periodo": relacion.periodo.name,
    }

@router.get("/{docente_id}/dashboard-estadistico", response_model=schemas.DashboardDocenteResponse)
def get_dashboard_docente(
    docente_id: int, 
    anio: int, 
    periodo: Periodo, 
    db: Session = Depends(get_db)
):
    ID_ENCUESTA_BASICO = 1
    ID_ENCUESTA_SUPERIOR = 4

    cantidad_total = estadisticas_services.get_cantidad_total_encuestas_docente(db, docente_id, anio, periodo)
    stats_basico = estadisticas_services.get_promedio_encuestas_docente_por_ciclo(db, docente_id, anio, periodo, ID_ENCUESTA_BASICO)
    stats_superior = estadisticas_services.get_promedio_encuestas_docente_por_ciclo(db, docente_id, anio, periodo, ID_ENCUESTA_SUPERIOR)
    stats_general = estadisticas_services.get_promedio_general_docente(db, docente_id, anio, periodo)
    stmt_materias = (
        select(Materia)
        .join(DocenteMateria, Materia.id == DocenteMateria.materia_id)
        .where(DocenteMateria.docente_id == docente_id)
        .where(DocenteMateria.anio == anio)
        .where(DocenteMateria.periodo == periodo)
    )
    materias_db = db.scalars(stmt_materias).all()
    
    lista_materias_info = [
        schemas.MateriaInfo(id=m.id, nombre=m.nombre, codigo=m.matricula) 
        for m in materias_db
    ]

    materia_ids = [m.id for m in materias_db]
    completados_count = 0
    pendientes_lista = []

    if materia_ids:
        informes_hechos = db.scalars(
            select(InformeCatedraCompletado)
            .join(DocenteMateria)
            .where(DocenteMateria.docente_id == docente_id)
            .where(DocenteMateria.materia_id.in_(materia_ids))
            .where(InformeCatedraCompletado.anio == anio)
            .where(InformeCatedraCompletado.periodo == periodo)
        ).all()
        
        completados_count = len(informes_hechos)
        ids_materias_hechas = [i.docente_materia.materia_id for i in informes_hechos]
        docente_info = services.leer_docente(db, docente_id)
        nombre_completo = f"{docente_info.nombre} {docente_info.apellido}" if docente_info else "Desconocido"

        for materia in materias_db:
            if materia.id not in ids_materias_hechas:
                pendientes_lista.append({
                    "materia": materia.nombre,
                    "docente_responsable": nombre_completo
                })

    total_esperados = len(materias_db)
    pendientes_count = total_esperados - completados_count

    progreso_data = {
        "completados": completados_count,
        "pendientes": pendientes_count
    }

    return schemas.DashboardDocenteResponse(
        total_encuestas_completadas=cantidad_total, 
        estadisticas_general=stats_general,        
        estadisticas_basico=stats_basico,
        estadisticas_superior=stats_superior,
        materias_del_ciclo=lista_materias_info,
        progreso=progreso_data,
        pendientes=pendientes_lista
    )