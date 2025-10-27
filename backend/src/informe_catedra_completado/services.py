from typing import List
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select
from src.informe_catedra_completado import schemas, models, exceptions
from src.informe_catedra_completado.models import InformeCatedraCompletado
from src.materias.models import Materia
from src.asociaciones.docente_materia.models import DocenteMateria
from src.asociaciones.models import Periodo
from src.respuestasInforme import services as respuestas_services


def obtener_informes_pendientes(db: Session, docente_id: int,anio: int,periodo: Periodo) -> List[dict]:
    relaciones = db.scalars(
        select(DocenteMateria)
        .options(joinedload(DocenteMateria.materia))
        .where(
            DocenteMateria.docente_id == docente_id,
            DocenteMateria.anio == anio,
            DocenteMateria.periodo == periodo
        )
    ).all()
    
    pendientes = []
    
    for relacion in relaciones:
        existe = db.scalar(
            select(InformeCatedraCompletado)
            .where(InformeCatedraCompletado.docente_materia_id == relacion.id)
        )

        if not existe:
            pendientes.append({
                "materia_id": relacion.materia.id,
                "materia_nombre": relacion.materia.nombre,
                "docente_materia_id": relacion.id
            })
    
    return pendientes


def verificar_informe_existente(db: Session, docente_materia_id: int) -> bool:
    informe = db.scalar(
        select(InformeCatedraCompletado)
        .where(InformeCatedraCompletado.docente_materia_id == docente_materia_id)
    )
    return informe is not None



def crear_informe_completado(db: Session, informe_data: schemas.InformeCatedraCompletadoConRespuestasCreate) -> models.InformeCatedraCompletado:
    relacion = db.scalar(
        select(DocenteMateria)
        .where(DocenteMateria.id == informe_data.docente_materia_id)
    )
    if not relacion:
        raise exceptions.DocenteMateriaNoEncontrada()
    
    if informe_data.contenido and not informe_data.contenido.strip():
        raise exceptions.InformeContenidoInvalido()
    
    existe = db.scalar(
        select(InformeCatedraCompletado)
        .where(InformeCatedraCompletado.docente_materia_id == informe_data.docente_materia_id)
    )
    if existe:
        raise exceptions.InformeCompletadoYaExiste()
    

    informe_db = models.InformeCatedraCompletado(
        docente_materia_id=informe_data.docente_materia_id,
        informe_catedra_base_id=informe_data.informe_catedra_base_id,
        titulo=informe_data.titulo,
        cantidadAlumnos=informe_data.cantidadAlumnos,
        contenido=informe_data.contenido,
        anio=informe_data.anio,
        periodo=informe_data.periodo,
        cantidadComisionesTeoricas=informe_data.cantidadComisionesTeoricas,
        cantidadComisionesPracticas=informe_data.cantidadComisionesPracticas,
    )
    db.add(informe_db)
    db.commit()  
    db.refresh(informe_db) 
        
    respuestas_con_id = []
    if informe_data.respuestas:
        for respuesta in informe_data.respuestas:
            respuesta_data = respuestas_services.schemas.RespuestaInformeCreate(
                **respuesta.model_dump(),
                informe_catedra_completado_id=informe_db.id 
            )
            respuestas_con_id.append(respuesta_data)
        respuestas_services.guardar_respuestas_lote(db, respuestas_con_id)
    return obtener_informe_completado(db, informe_db.id)


def obtener_informe_completado(db: Session, informe_id: int) -> models.InformeCatedraCompletado:
    informe = db.scalar(select(InformeCatedraCompletado).where(InformeCatedraCompletado.id == informe_id))
    if not informe:
        raise exceptions.InformeCompletadoNoEncontrado()
    return informe

def obtener_informes_por_departamento(db: Session, departamento_id: int) -> List[models.InformeCatedraCompletado]:
    informes = db.scalars(
        select(InformeCatedraCompletado)
        .join(DocenteMateria, InformeCatedraCompletado.docente_materia_id == DocenteMateria.id)
        .join(Materia, DocenteMateria.materia_id == Materia.id)
        .where(Materia.departamento_id == departamento_id)
    ).all()
    return informes