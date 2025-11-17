from typing import List, Optional
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
from src.encuestaCompletada.models import EncuestaCompletada
from src.asociaciones.models import materia_carrera


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


def get_progreso_departamento( db: Session, departamento_id: int, anio: int,  periodo: Periodo,carrera_id: Optional[int] = None ):
    stmt_base = (
        select(DocenteMateria.id)
        .join(Materia)
        .where(
            Materia.departamento_id == departamento_id,
            DocenteMateria.anio == anio,
            DocenteMateria.periodo == periodo
        )
    )

    if carrera_id is not None:
        stmt_base = stmt_base.join(
            materia_carrera, Materia.id == materia_carrera.c.materia_id
        ).where(materia_carrera.c.carrera_id == carrera_id)

    docente_materia_ids = db.scalars(stmt_base).all()

    if not docente_materia_ids:
        return {"completados": 0, "pendientes": 0}

    total_materias_esperadas = len(docente_materia_ids)

    completados = db.scalar(
        select(func.count(InformeCatedraCompletado.id))
        .where(
            InformeCatedraCompletado.docente_materia_id.in_(docente_materia_ids)
        )
        .where(InformeCatedraCompletado.anio == anio)
        .where(InformeCatedraCompletado.periodo == periodo)
    )
    
    completados_count = completados if completados else 0
    pendientes = total_materias_esperadas - completados_count

    return {"completados": completados_count, "pendientes": pendientes}


def obtener_informes_pendientes_por_departamento( db: Session, departamento_id: int, anio: int, periodo: Periodo, carrera_id: Optional[int] = None ) -> List[dict]:
    stmt = (
        select(DocenteMateria)
        .join(Materia)
        .where(
            Materia.departamento_id == departamento_id,
            DocenteMateria.anio == anio,
            DocenteMateria.periodo == periodo
        )
        .options(
            joinedload(DocenteMateria.materia),
            joinedload(DocenteMateria.docente)
        )
    )

    if carrera_id is not None:
        stmt = stmt.join(
            materia_carrera,
            Materia.id == materia_carrera.c.materia_id
        )
        
        stmt = stmt.where(materia_carrera.c.carrera_id == carrera_id)

    relaciones_depto = db.scalars(stmt).unique().all()

    if not relaciones_depto:
        return []

    ids_relaciones = [r.id for r in relaciones_depto]
    
    informes_completados_ids = db.scalars(
        select(InformeCatedraCompletado.docente_materia_id)
        .where(InformeCatedraCompletado.docente_materia_id.in_(ids_relaciones))
        .where(InformeCatedraCompletado.anio == anio)
        .where(InformeCatedraCompletado.periodo == periodo)
    ).all()
    
    set_completados = set(informes_completados_ids)
    pendientes = []
    for relacion in relaciones_depto:
        if relacion.id not in set_completados:
            docente_nombre = "No asignado"
            if relacion.docente:
                docente_nombre = f"{relacion.docente.nombre} {relacion.docente.apellido}"

            pendientes.append({
                "materia": relacion.materia.nombre,
                "docente_responsable": docente_nombre
            })
            
    return pendientes