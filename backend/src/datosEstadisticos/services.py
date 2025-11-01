from typing import List
from sqlalchemy import delete, select, update, func
from sqlalchemy.orm import Session
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

def obtener_respuestas_abiertas_por_materia(
    db: Session,
    id_materia: int,
    anio: int,
    periodo: Periodo
) -> List[schemas.DatosAbiertosCategoria]:

    materia: Materia = db.scalar(select(Materia).where(Materia.id == id_materia))
    encuesta = materia.encuesta

    categoria_g: Categoria = next((c for c in encuesta.categorias if c.cod == "G"), None)
    if not categoria_g:
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

    respuestas_abiertas = db.scalars(
        select(Respuesta)
        .where(Respuesta.encuesta_completada_id.in_(ids_encuestas))
        .where(Respuesta.texto_respuesta != None)
    ).all()

    # Agrupar respuestas por pregunta
    resultado = []
    for pregunta in categoria_g.preguntas[:3]:
        respuestas_pregunta = [
            r.texto_respuesta for r in respuestas_abiertas if r.pregunta_id == pregunta.id
        ]

        if len(respuestas_pregunta) == 0:
            continue

        resultado.append(
            schemas.DatosAbiertosPregunta(
                id_pregunta=pregunta.id,
                enunciado=pregunta.enunciado,
                respuestas=respuestas_pregunta
            )
        )

    return [
        schemas.DatosAbiertosCategoria(
            categoria_cod=categoria_g.cod,
            categoria_texto=categoria_g.texto,
            preguntas=resultado
        )
    ]