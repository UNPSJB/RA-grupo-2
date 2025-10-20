from typing import List
from sqlalchemy import delete, select, update
from sqlalchemy.orm import Session
from src.informeCatedraCompletado.models import DatosEstadisticosInforme, DatosEstadisticosPregunta
from src.informe_catedra.models import InformeCatedra
from src.encuestaCompletada.models import EncuestaCompletada
from src.materias.models import Materia
from src.respuestas.models import Respuesta
from src.opciones.models import Opcion
from src.encuestas.models import Encuesta
from src.asociaciones.models import Periodo
from src.informeCatedraCompletado import schemas
from src.encuestas import services as encuesta_services
from src.preguntas import schemas as pregunta_schemas

def obtener_datos_estadisticos(db: Session, id_materia: int, anio: int, periodo: Periodo) -> List[schemas.DatosEstadisticosPregunta]:
    materia: Materia = db.scalar(select(Materia).where(Materia.id == id_materia))     
    encuesta: Encuesta = materia.encuesta
    preguntas: List[pregunta_schemas.PreguntaCerrada] = encuesta_services.listar_preguntas_cerradas_encuesta(db, encuesta.id)

    if len(preguntas) == 0:
        return []
    
    encuestas_completadas = db.scalars(
        select(EncuestaCompletada)  
        .where(EncuestaCompletada.materia_id == id_materia)
        .where(EncuestaCompletada.anio == anio)
        .where(EncuestaCompletada.periodo == periodo)
    ).all()

    if len(encuestas_completadas) == 0:
        return []
    
    ids_encuestas = [e.id for e in encuestas_completadas]
    respuestas = db.scalars(
        select(Respuesta).where(Respuesta.encuesta_completada_id.in_(ids_encuestas))
    ).all()
    
    datos_estadisticos: List[schemas.DatosEstadisticosPregunta] = []
    total_encuestas = len(encuestas_completadas)

    for pregunta in preguntas:
        datos_opciones : List[schemas.OpcionPorcentaje] = []
        respuestas_pregunta = [r for r in respuestas if r.pregunta_id == pregunta.id]
        opciones: List[Opcion] = pregunta.opciones

        for opcion in opciones:
            respuestas_opcion = [r for r in respuestas_pregunta if r.opcion_id == opcion.id]
            cantidad = len(respuestas_opcion)
            porcentaje = (cantidad / total_encuestas * 100) 

            datos_opciones.append(
                schemas.OpcionPorcentaje(opcion_id=opcion.id, porcentaje=round(porcentaje, 2))
            )
        
        datos_pregunta = schemas.DatosEstadisticosPregunta(id_pregunta=pregunta.id, datos=datos_opciones)
        datos_estadisticos.append(datos_pregunta)
        
    return datos_estadisticos


def guardar_datos_estadisticos(
    db: Session,
    id_informe_catedra: int
):
    informe_catedra: InformeCatedra = db.scalar(
        select(InformeCatedra).where(InformeCatedra.id == id_informe_catedra)
    )

    if not informe_catedra:
        raise ValueError(f"No se encontró un InformeCatedra con id={id_informe_catedra}")

    anio = informe_catedra.anio
    periodo = informe_catedra.periodo
    materia_id = informe_catedra.docente_materia.materia_id

    materia: Materia = db.scalar(select(Materia).where(Materia.id == materia_id))
    encuesta: Encuesta = materia.encuesta

    preguntas: List[pregunta_schemas.PreguntaCerrada] = encuesta_services.listar_preguntas_cerradas_encuesta(
        db, encuesta.id
    )

    if not preguntas:
        return

    encuestas_completadas = db.scalars(
        select(EncuestaCompletada)
        .where(EncuestaCompletada.materia_id == materia_id)
        .where(EncuestaCompletada.anio == anio)
        .where(EncuestaCompletada.periodo == periodo)
    ).all()

    if not encuestas_completadas:
        return

    ids_encuestas = [e.id for e in encuestas_completadas]

    respuestas = db.scalars(
        select(Respuesta).where(Respuesta.encuesta_completada_id.in_(ids_encuestas))
    ).all()

    total_encuestas = len(encuestas_completadas)

    for pregunta in preguntas:
        datos_informe = DatosEstadisticosInforme(
            id_informe_catedra_completado=informe_catedra.id,
            id_pregunta_encuesta=pregunta.id,
        )
        db.add(datos_informe)
        db.flush()  

        respuestas_pregunta = [r for r in respuestas if r.pregunta_id == pregunta.id]

        for opcion in pregunta.opciones:
            respuestas_opcion = [r for r in respuestas_pregunta if r.opcion_id == opcion.id]
            cantidad = len(respuestas_opcion)
            porcentaje = (cantidad / total_encuestas * 100)

            datos_pregunta = DatosEstadisticosPregunta(
                id_datos_estadisticos_informe=datos_informe.id,
                id_opcion=opcion.id,
                porcentaje=round(porcentaje, 2),
            )
            db.add(datos_pregunta)

    db.commit()


def recuperar_datos_estadisticos(
    db: Session,
    id_informe_catedra_completado: int
) -> List[schemas.DatosEstadisticosPregunta]:

    informes = db.scalars(
        select(DatosEstadisticosInforme)
        .where(DatosEstadisticosInforme.id_informe_catedra_completado == id_informe_catedra_completado)
    ).all()

    datos_estadisticos: List[schemas.DatosEstadisticosPregunta] = []

    for inf in informes:
        datos_pregunta = db.scalars(
            select(DatosEstadisticosPregunta)
            .where(DatosEstadisticosPregunta.id_datos_estadisticos_informe == inf.id)
        ).all()

        opciones = [
            schemas.OpcionPorcentaje(
                opcion_id=d.id_opcion,
                porcentaje=d.porcentaje
            )
            for d in datos_pregunta
        ]

        datos_estadisticos.append(
            schemas.DatosEstadisticosPregunta(
                id_pregunta=inf.id_pregunta_encuesta,
                datos=opciones
            )
        )

    return datos_estadisticos

