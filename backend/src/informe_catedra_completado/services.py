from typing import List
from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import select, func
from src.informe_catedra_completado import schemas, models, exceptions
from src.informe_catedra_completado.models import InformeCatedraCompletado
from src.materias.models import Materia
from src.asociaciones.docente_materia.models import DocenteMateria
from src.asociaciones.models import Periodo
from src.respuestasInforme import services as respuestas_services
from src.respuestasInforme.models import RespuestaInforme
from src.preguntas.models import Pregunta


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

def obtener_informes_completados(db: Session, docente_id: int) -> List[models.InformeCatedraCompletado]:
    informes = db.scalars(
        select(InformeCatedraCompletado)
        .join(DocenteMateria, InformeCatedraCompletado.docente_materia_id == DocenteMateria.id)
        .where(DocenteMateria.docente_id == docente_id)
    ).all()
    return informes

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
        JTP=informe_data.JTP,
        aux_primera=informe_data.aux_primera,
        aux_segunda=informe_data.aux_segunda
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
    stmt = (
        select(models.InformeCatedraCompletado)
        .where(models.InformeCatedraCompletado.id == informe_id)
        .options(
            selectinload(models.InformeCatedraCompletado.respuestas_informe)
            .selectinload(RespuestaInforme.pregunta)
        )
    )
    
    informe = db.scalar(stmt)
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


def obtener_informe_completado_detalle(db: Session, informe_id: int) -> dict:
    stmt = (
        select(models.InformeCatedraCompletado)
        .where(models.InformeCatedraCompletado.id == informe_id)
        .options(
            selectinload(models.InformeCatedraCompletado.respuestas_informe)
            .selectinload(RespuestaInforme.pregunta),
            joinedload(models.InformeCatedraCompletado.docente_materia) 
                .joinedload(DocenteMateria.materia),
            joinedload(models.InformeCatedraCompletado.docente_materia)
                .joinedload(DocenteMateria.docente)
        )
    )
    
    informe = db.scalar(stmt)
    if not informe:
        raise exceptions.InformeCompletadoNoEncontrado()
    
    informe_dict = {
        "id": informe.id,
        "docente_materia_id": informe.docente_materia_id,
        "informe_catedra_base_id": informe.informe_catedra_base_id,
        "titulo": informe.titulo,
        "contenido": informe.contenido,
        "cantidadAlumnos": informe.cantidadAlumnos,
        "anio": informe.anio,
        "periodo": informe.periodo,
        "cantidadComisionesTeoricas": informe.cantidadComisionesTeoricas,
        "cantidadComisionesPracticas": informe.cantidadComisionesPracticas,
        "respuestas_informe": informe.respuestas_informe,
        "JTP": informe.JTP,
        "aux_primera": informe.aux_primera,
        "aux_segunda": informe.aux_segunda,
        
        "materiaId": -1, 
        "materiaNombre": None,
        "materiaCodigo": None,
        "docenteResponsable": None,
        "sede": "Trelew"  #CORREGIR CON SEDE DE VERDAD
    }

    if informe.docente_materia:
        if informe.docente_materia.materia:
            informe_dict["materiaId"] = informe.docente_materia.materia.id
            informe_dict["materiaNombre"] = informe.docente_materia.materia.nombre
            informe_dict["materiaCodigo"] = informe.docente_materia.materia.matricula
        
        if informe.docente_materia.docente:
            docente = informe.docente_materia.docente
            informe_dict["docenteResponsable"] = f"{docente.nombre} {docente.apellido}"

    return informe_dict