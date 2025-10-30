from typing import List
from sqlalchemy import delete, select, update, func
from sqlalchemy.orm import Session
from src.datosEstadisticos.models import DatosEstadisticosInforme, DatosEstadisticosPregunta
from src.informe_catedra_completado.models import InformeCatedraCompletado
from src.encuestaCompletada.models import EncuestaCompletada
from src.materias.models import Materia
from src.preguntas.models import Pregunta
from src.respuestas.models import Respuesta
from src.categorias.models import Categoria
from src.opciones.models import Opcion
from src.encuestas.models import Encuesta
from src.asociaciones.models import Periodo
from src.datosEstadisticos import schemas
from src.encuestas import services as encuesta_services
from src.preguntas import schemas as pregunta_schemas

def obtener_datos_estadisticos(db: Session, id_materia: int, anio: int, periodo: Periodo):
    materia: Materia = db.scalar(select(Materia).where(Materia.id == id_materia))     
    encuesta: Encuesta = materia.encuesta
    categorias: List[Categoria] = encuesta.categorias

    categorias = [c for c in categorias if c.cod != "A"]

    if not categorias:
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

    total_encuestas = len(encuestas_completadas)
    
    resultado: List[schemas.DatosEstadisticosCategoria] = []

    for categoria in categorias:
        if categoria.cod == "G":
            preguntas_info = []
        else:
            preguntas_categoria = [p for p in categoria.preguntas if p.tipo == "cerrada"]
            if not preguntas_categoria:
                continue

            preguntas_info = []
            acumulados = {}
            conteo = {}

            for pregunta in preguntas_categoria:
                respuestas_pregunta = [r for r in respuestas if r.pregunta_id == pregunta.id]
                opciones = pregunta.opciones

                datos_opciones = []
                for opcion in opciones:
                    respuestas_opcion = [r for r in respuestas_pregunta if r.opcion_id == opcion.id]
                    cantidad = len(respuestas_opcion)
                    porcentaje = (cantidad / total_encuestas * 100)

                    datos_opciones.append(
                        schemas.OpcionPorcentaje(opcion_id=opcion.contenido, porcentaje=round(porcentaje, 2))
                    )

                    acumulados[opcion.contenido] = acumulados.get(opcion.contenido, 0) + porcentaje
                    conteo[opcion.contenido] = conteo.get(opcion.contenido, 0) + 1

                preguntas_info.append(
                    schemas.DatosEstadisticosPregunta(
                        id_pregunta=pregunta.enunciado,
                        datos=datos_opciones
                    )
                )

            promedio_opciones = [
                schemas.OpcionPorcentaje(
                    opcion_id=op,
                    porcentaje=round(acumulados[op] / conteo[op], 2) if conteo[op] > 0 else 0.0
                )
                for op in acumulados.keys()
            ]

        resultado.append(
            schemas.DatosEstadisticosCategoria(
                categoria_cod=categoria.cod,
                categoria_texto=categoria.texto,
                promedio_categoria=promedio_opciones,
                preguntas=preguntas_info
            )
        )

    return resultado

def guardar_datos_estadisticos(
    db: Session,
    id_informe_catedra: int
):
    informe_catedra: InformeCatedraCompletado = db.scalar(
        select(InformeCatedraCompletado).where(InformeCatedraCompletado.id == id_informe_catedra)
    )

    if not informe_catedra:
        raise ValueError(f"No se encontró un informe completado con id={id_informe_catedra}")

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
        pregunta = db.scalar(
            select(Pregunta)  
            .where(Pregunta.id == inf.id_pregunta_encuesta)
        )

        datos_pregunta = db.scalars(
            select(DatosEstadisticosPregunta)
            .where(DatosEstadisticosPregunta.id_datos_estadisticos_informe == inf.id)
        ).all()

        opciones = []
        for d in datos_pregunta:
            opcion = db.scalar(select(Opcion).where(Opcion.id == d.id_opcion))

            opciones.append(
                schemas.OpcionPorcentaje(
                    opcion_id=opcion.contenido if opcion else str(d.id_opcion),
                    porcentaje=d.porcentaje
                )
            )

        datos_estadisticos.append(
            schemas.DatosEstadisticosPregunta(
                id_pregunta=pregunta.enunciado if pregunta else str(inf.id_pregunta_encuesta),
                datos=opciones
            )
        )

    return datos_estadisticos



def cantidad_encuestas_completadas(
    db: Session,
    id_materia: int,
    anio: int,
    periodo: str
) -> int:
    stmt = (
        select(func.count())
        .select_from(EncuestaCompletada)
        .where(EncuestaCompletada.materia_id == id_materia)
        .where(EncuestaCompletada.anio == anio)
        .where(EncuestaCompletada.periodo == periodo)
    )
    count = db.scalar(stmt)
    return count or 0
