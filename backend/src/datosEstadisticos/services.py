from typing import List, Optional
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
from src.asociaciones.models import materia_carrera
from src.asociaciones.docente_materia.models import DocenteMateria
from src.asociaciones.models import alumno_materia

def obtener_datos_estadisticos(db: Session, id_materia: int, anio: int, periodo: Periodo):
    materia = db.scalar(select(Materia).where(Materia.id == id_materia))      
    encuesta = materia.encuesta
    categorias = [c for c in encuesta.categorias if c.cod != "A"]

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

ID_ENCUESTA_BASICO = 1
ID_ENCUESTA_SUPERIOR = 4

def get_promedio_encuestas_BASICO( db: Session, departamento_id: int, anio: int, periodo: Periodo, carrera_id: Optional[int] = None ):
    stmt_materias = (
        select(Materia.id)
        .where(Materia.departamento_id == departamento_id)
        .where(Materia.encuesta_id == ID_ENCUESTA_BASICO)
    )

    if carrera_id is not None:
        stmt_materias = stmt_materias.join(
            materia_carrera,  
            Materia.id == materia_carrera.c.materia_id 
        ).where(
            materia_carrera.c.carrera_id == carrera_id 
        )

    materia_ids = db.scalars(stmt_materias).all()

    if not materia_ids:
        return {"promedio_por_categoria": [], "promedio_general": []}
    
    encuestas_completadas = db.scalars(
        select(EncuestaCompletada)  
        .where(EncuestaCompletada.materia_id.in_(materia_ids)) 
        .where(EncuestaCompletada.anio == anio)
        .where(EncuestaCompletada.periodo == periodo)
    ).all()

    if len(encuestas_completadas) == 0:
        return {"promedio_por_categoria": [], "promedio_general": []}
    
    ids_encuestas = [e.id for e in encuestas_completadas]
    respuestas = db.scalars(
        select(Respuesta).where(Respuesta.encuesta_completada_id.in_(ids_encuestas))
    ).all()
    
    primera_encuesta_id = encuestas_completadas[0].encuesta_id
    encuesta = db.get(Encuesta, primera_encuesta_id)
    categorias: List[Categoria] = [c for c in encuesta.categorias if c.cod != "A"]

    if not categorias:
        return {"promedio_por_categoria": [], "promedio_general": []}
    
    total_encuestas = len(encuestas_completadas)
    resultado: List[schemas.DatosEstadisticosCategoria] = []
    
    acumulados_generales = {}
    conteo_generales = {}

    for categoria in categorias:
        if categoria.cod == "G":
            promedio_opciones = [] 
        else:
            preguntas_categoria = [p for p in categoria.preguntas if p.tipo == "cerrada"]
            if not preguntas_categoria:
                continue

            acumulados_locales = {}
            conteo_locales = {}

            for pregunta in preguntas_categoria:
                respuestas_pregunta = [r for r in respuestas if r.pregunta_id == pregunta.id]
                opciones = pregunta.opciones

                for opcion in opciones:
                    respuestas_opcion = [r for r in respuestas_pregunta if r.opcion_id == opcion.id]
                    cantidad = len(respuestas_opcion)
                    porcentaje = (cantidad / total_encuestas * 100)

                    acumulados_locales[opcion.contenido] = acumulados_locales.get(opcion.contenido, 0) + porcentaje
                    conteo_locales[opcion.contenido] = conteo_locales.get(opcion.contenido, 0) + 1
                    
                    acumulados_generales[opcion.contenido] = acumulados_generales.get(opcion.contenido, 0) + porcentaje
                    conteo_generales[opcion.contenido] = conteo_generales.get(opcion.contenido, 0) + 1

            promedio_opciones = [
                schemas.OpcionPorcentaje(
                    opcion_id=op,
                    porcentaje=round(acumulados_locales[op] / conteo_locales[op], 2) if conteo_locales[op] > 0 else 0.0
                )
                for op in acumulados_locales.keys()
            ]

            suma_porcentajes = sum(op.porcentaje for op in promedio_opciones)
            if suma_porcentajes > 0:
                for op_porcentaje in promedio_opciones:
                    op_porcentaje.porcentaje = round(
                        (op_porcentaje.porcentaje / suma_porcentajes) * 100,
                        2
                    )

        resultado.append(
            schemas.DatosEstadisticosCategoria(
                categoria_cod=categoria.cod,
                categoria_texto=categoria.texto,
                promedio_categoria=promedio_opciones, 
                preguntas=[] 
            )
        )
    
    promedio_general = [
        schemas.OpcionPorcentaje(
            opcion_id=op,
            porcentaje=round(acumulados_generales[op] / conteo_generales[op], 2) if conteo_generales[op] > 0 else 0.0
        )
        for op in acumulados_generales.keys()
    ]

    suma_porcentajes_general = sum(op.porcentaje for op in promedio_general)
    if suma_porcentajes_general > 0:
        for op_porcentaje in promedio_general:
            op_porcentaje.porcentaje = round(
                (op_porcentaje.porcentaje / suma_porcentajes_general) * 100,
                2
            )


    return {
        "promedio_por_categoria": resultado,
        "promedio_general": promedio_general
    }


def get_promedio_encuestas_SUPERIOR( db: Session, departamento_id: int, anio: int, periodo: Periodo, carrera_id: Optional[int] = None ):
    stmt_materias = (
        select(Materia.id)
        .where(Materia.departamento_id == departamento_id)
        .where(Materia.encuesta_id == ID_ENCUESTA_SUPERIOR)
    )

    if carrera_id is not None:
        stmt_materias = stmt_materias.join(
            materia_carrera,  
            Materia.id == materia_carrera.c.materia_id 
        ).where(
            materia_carrera.c.carrera_id == carrera_id 
        )

    materia_ids = db.scalars(stmt_materias).all()

    if not materia_ids:
        return {"promedio_por_categoria": [], "promedio_general": []}
    
    encuestas_completadas = db.scalars(
        select(EncuestaCompletada)  
        .where(EncuestaCompletada.materia_id.in_(materia_ids)) 
        .where(EncuestaCompletada.anio == anio)
        .where(EncuestaCompletada.periodo == periodo)
    ).all()

    if len(encuestas_completadas) == 0:
        return {"promedio_por_categoria": [], "promedio_general": []}
    
    ids_encuestas = [e.id for e in encuestas_completadas]
    respuestas = db.scalars(
        select(Respuesta).where(Respuesta.encuesta_completada_id.in_(ids_encuestas))
    ).all()
    
    primera_encuesta_id = encuestas_completadas[0].encuesta_id
    encuesta = db.get(Encuesta, primera_encuesta_id)
    categorias: List[Categoria] = [c for c in encuesta.categorias if c.cod != "A"]

    if not categorias:
        return {"promedio_por_categoria": [], "promedio_general": []}
    
    total_encuestas = len(encuestas_completadas)
    resultado: List[schemas.DatosEstadisticosCategoria] = []

    acumulados_generales = {}
    conteo_generales = {}

    for categoria in categorias:
        if categoria.cod == "G":
            promedio_opciones = [] 
        else:
            preguntas_categoria = [p for p in categoria.preguntas if p.tipo == "cerrada"]
            if not preguntas_categoria:
                continue

            acumulados_locales = {}
            conteo_locales = {}

            for pregunta in preguntas_categoria:
                respuestas_pregunta = [r for r in respuestas if r.pregunta_id == pregunta.id]
                opciones = pregunta.opciones

                for opcion in opciones:
                    respuestas_opcion = [r for r in respuestas_pregunta if r.opcion_id == opcion.id]
                    cantidad = len(respuestas_opcion)
                    porcentaje = (cantidad / total_encuestas * 100)

                    acumulados_locales[opcion.contenido] = acumulados_locales.get(opcion.contenido, 0) + porcentaje
                    conteo_locales[opcion.contenido] = conteo_locales.get(opcion.contenido, 0) + 1
                    
                    acumulados_generales[opcion.contenido] = acumulados_generales.get(opcion.contenido, 0) + porcentaje
                    conteo_generales[opcion.contenido] = conteo_generales.get(opcion.contenido, 0) + 1

            promedio_opciones = [
                schemas.OpcionPorcentaje(
                    opcion_id=op,
                    porcentaje=round(acumulados_locales[op] / conteo_locales[op], 2) if conteo_locales[op] > 0 else 0.0
                )
                for op in acumulados_locales.keys()
            ]

            suma_porcentajes = sum(op.porcentaje for op in promedio_opciones)
            if suma_porcentajes > 0:
                for op_porcentaje in promedio_opciones:
                    op_porcentaje.porcentaje = round(
                        (op_porcentaje.porcentaje / suma_porcentajes) * 100,
                        2
                    )

        resultado.append(
            schemas.DatosEstadisticosCategoria(
                categoria_cod=categoria.cod,
                categoria_texto=categoria.texto,
                promedio_categoria=promedio_opciones, 
                preguntas=[] 
            )
        )

    promedio_general = [
        schemas.OpcionPorcentaje(
            opcion_id=op,
            porcentaje=round(acumulados_generales[op] / conteo_generales[op], 2) if conteo_generales[op] > 0 else 0.0
        )
        for op in acumulados_generales.keys()
    ]

    suma_porcentajes_general = sum(op.porcentaje for op in promedio_general)
    if suma_porcentajes_general > 0:
        for op_porcentaje in promedio_general:
            op_porcentaje.porcentaje = round(
                (op_porcentaje.porcentaje / suma_porcentajes_general) * 100,
                2
            )

    return {
        "promedio_por_categoria": resultado,
        "promedio_general": promedio_general
    }

def obtener_datos_estadisticos_con_detalle(db: Session, id_materia: int, anio: int, periodo: Periodo):
    materia = db.scalar(select(Materia).where(Materia.id == id_materia))
    encuesta = materia.encuesta
    categorias = [c for c in encuesta.categorias if c.cod != "A"]

    if not categorias: return {"promedio_por_categoria": [], "promedio_general": []}
    
    encuestas_completadas = db.scalars(
        select(EncuestaCompletada)
        .where(EncuestaCompletada.materia_id == id_materia)
        .where(EncuestaCompletada.anio == anio)
        .where(EncuestaCompletada.periodo == periodo)
    ).all()

    if not encuestas_completadas: return {"promedio_por_categoria": [], "promedio_general": []}
    
    ids_encuestas = [e.id for e in encuestas_completadas]
    respuestas = db.scalars(select(Respuesta).where(Respuesta.encuesta_completada_id.in_(ids_encuestas))).all()
    total_encuestas = len(encuestas_completadas)
    
    resultado = []
    acumulados_generales = {}
    conteo_generales = {}

    for categoria in categorias:
        if categoria.cod == "G": continue
        
        preguntas_cat = [p for p in categoria.preguntas if p.tipo == "cerrada"]
        if not preguntas_cat: continue

        acumulados_locales = {}
        conteo_locales = {}

        lista_preguntas_detalle = [] 

        for pregunta in preguntas_cat:
            respuestas_pregunta = [r for r in respuestas if r.pregunta_id == pregunta.id]
            datos_opciones_pregunta = [] 

            for opcion in pregunta.opciones:
                resp_op = [r for r in respuestas_pregunta if r.opcion_id == opcion.id]
                cantidad = len(resp_op)
                porcentaje = (cantidad / total_encuestas * 100)

                datos_opciones_pregunta.append(
                    schemas.OpcionPorcentaje(opcion_id=opcion.contenido, porcentaje=round(porcentaje, 2))
                )
                acumulados_locales[opcion.contenido] = acumulados_locales.get(opcion.contenido, 0) + porcentaje
                conteo_locales[opcion.contenido] = conteo_locales.get(opcion.contenido, 0) + 1
                acumulados_generales[opcion.contenido] = acumulados_generales.get(opcion.contenido, 0) + porcentaje
                conteo_generales[opcion.contenido] = conteo_generales.get(opcion.contenido, 0) + 1
            
            lista_preguntas_detalle.append(
                schemas.DatosEstadisticosPregunta(
                    id_pregunta=pregunta.enunciado,
                    datos=datos_opciones_pregunta
                )
            )

        prom_op = [schemas.OpcionPorcentaje(opcion_id=op, porcentaje=round(acumulados_locales[op]/conteo_locales[op], 2) if conteo_locales[op]>0 else 0.0) for op in acumulados_locales.keys()]
        s_loc = sum(p.porcentaje for p in prom_op)
        if s_loc > 0: 
            for p in prom_op: p.porcentaje = round((p.porcentaje/s_loc)*100, 2)

        resultado.append(
            schemas.DatosEstadisticosCategoria(
                categoria_cod=categoria.cod,
                categoria_texto=categoria.texto,
                promedio_categoria=prom_op,
                preguntas=lista_preguntas_detalle 
            )
        )

    promedio_general = [schemas.OpcionPorcentaje(opcion_id=op, porcentaje=round(acumulados_generales[op]/conteo_generales[op], 2) if conteo_generales[op]>0 else 0.0) for op in acumulados_generales.keys()]
    s_gen = sum(p.porcentaje for p in promedio_general)
    if s_gen > 0: 
        for p in promedio_general: p.porcentaje = round((p.porcentaje/s_gen)*100, 2)

    return {
        "promedio_por_categoria": resultado,
        "promedio_general": promedio_general
    }
def get_cantidad_total_encuestas_docente(db: Session, docente_id: int, anio: int, periodo: Periodo) -> int:
    stmt_materias = select(Materia.id).join(DocenteMateria, Materia.id == DocenteMateria.materia_id).where(DocenteMateria.docente_id == docente_id).where(DocenteMateria.anio == anio).where(DocenteMateria.periodo == periodo)
    materia_ids = db.scalars(stmt_materias).all()
    if not materia_ids: return 0
    count = db.scalar(select(func.count()).select_from(EncuestaCompletada).where(EncuestaCompletada.materia_id.in_(materia_ids)).where(EncuestaCompletada.anio == anio).where(EncuestaCompletada.periodo == periodo))
    return count or 0

def get_promedio_encuestas_docente_por_ciclo(db: Session, docente_id: int, anio: int, periodo: Periodo, id_encuesta_tipo: int):
    stmt_materias = select(Materia.id).join(DocenteMateria, Materia.id == DocenteMateria.materia_id).where(DocenteMateria.docente_id == docente_id).where(DocenteMateria.anio == anio).where(DocenteMateria.periodo == periodo).where(Materia.encuesta_id == id_encuesta_tipo)
    materia_ids = db.scalars(stmt_materias).all()
    
    if not materia_ids:
        return {"promedio_por_categoria": [], "promedio_general": []}
    
    encuestas_completadas = db.scalars(
        select(EncuestaCompletada)
        .where(EncuestaCompletada.materia_id.in_(materia_ids))
        .where(EncuestaCompletada.anio == anio)
        .where(EncuestaCompletada.periodo == periodo)
    ).all()

    if not encuestas_completadas: return {"promedio_por_categoria": [], "promedio_general": []}
    
    ids_encuestas = [e.id for e in encuestas_completadas]
    respuestas = db.scalars(select(Respuesta).where(Respuesta.encuesta_completada_id.in_(ids_encuestas))).all()
    
    primera_encuesta_id = encuestas_completadas[0].encuesta_id
    encuesta = db.get(Encuesta, primera_encuesta_id)
    categorias = [c for c in encuesta.categorias if c.cod != "A"]
    
    total_encuestas = len(encuestas_completadas)
    resultado = []
    acumulados_generales = {}
    conteo_generales = {}

    for categoria in categorias:
        if categoria.cod == "G": continue
        preguntas_cat = [p for p in categoria.preguntas if p.tipo == "cerrada"]
        if not preguntas_cat: continue

        acumulados_locales = {}
        conteo_locales = {}

        for pregunta in preguntas_cat:
            respuestas_pregunta = [r for r in respuestas if r.pregunta_id == pregunta.id]
            for opcion in pregunta.opciones:
                resp_op = [r for r in respuestas_pregunta if r.opcion_id == opcion.id]
                cantidad = len(resp_op)
                porcentaje = (cantidad / total_encuestas * 100)

                acumulados_locales[opcion.contenido] = acumulados_locales.get(opcion.contenido, 0) + porcentaje
                conteo_locales[opcion.contenido] = conteo_locales.get(opcion.contenido, 0) + 1
                
                acumulados_generales[opcion.contenido] = acumulados_generales.get(opcion.contenido, 0) + porcentaje
                conteo_generales[opcion.contenido] = conteo_generales.get(opcion.contenido, 0) + 1

        prom_op = [schemas.OpcionPorcentaje(opcion_id=op, porcentaje=round(acumulados_locales[op]/conteo_locales[op], 2) if conteo_locales[op]>0 else 0.0) for op in acumulados_locales.keys()]
        s_loc = sum(p.porcentaje for p in prom_op)
        if s_loc > 0: 
            for p in prom_op: p.porcentaje = round((p.porcentaje/s_loc)*100, 2)

        resultado.append(schemas.DatosEstadisticosCategoria(categoria_cod=categoria.cod, categoria_texto=categoria.texto, promedio_categoria=prom_op, preguntas=[]))

    promedio_general = [schemas.OpcionPorcentaje(opcion_id=op, porcentaje=round(acumulados_generales[op]/conteo_generales[op], 2) if conteo_generales[op]>0 else 0.0) for op in acumulados_generales.keys()]
    s_gen = sum(p.porcentaje for p in promedio_general)
    if s_gen > 0: 
        for p in promedio_general: p.porcentaje = round((p.porcentaje/s_gen)*100, 2)

    return {
        "promedio_por_categoria": resultado,
        "promedio_general": promedio_general
    }
    
def obtener_cantidad_inscriptos(db: Session, id_materia: int, anio: int, periodo: str) -> int:
    stmt = (
        select(func.count())
        .select_from(alumno_materia)
        .where(alumno_materia.c.materia_id == id_materia)
        .where(alumno_materia.c.anio == anio)
        .where(alumno_materia.c.periodo == periodo)
    )
    return db.scalar(stmt) or 0

def get_promedio_general_docente(db: Session, docente_id: int, anio: int, periodo: str):
    subquery_materias = (
        select(DocenteMateria.materia_id)
        .where(DocenteMateria.docente_id == docente_id)
        .where(DocenteMateria.anio == anio)
        .where(DocenteMateria.periodo == periodo)
    ).scalar_subquery()

    total_respuestas = db.scalar(
        select(func.count(Respuesta.id))
        .join(EncuestaCompletada, Respuesta.encuesta_completada_id == EncuestaCompletada.id)
        .where(EncuestaCompletada.materia_id.in_(subquery_materias))
        .where(EncuestaCompletada.anio == anio)
        .where(EncuestaCompletada.periodo == periodo)
        .where(Respuesta.opcion_id.isnot(None)) 
    )

    if not total_respuestas or total_respuestas == 0:
        return []

    resultados = db.execute(
        select(
            Opcion.contenido,
            func.count(Respuesta.id).label("cantidad")
        )
        .join(Respuesta, Respuesta.opcion_id == Opcion.id)
        .join(EncuestaCompletada, Respuesta.encuesta_completada_id == EncuestaCompletada.id)
        .where(EncuestaCompletada.materia_id.in_(subquery_materias))
        .where(EncuestaCompletada.anio == anio)
        .where(EncuestaCompletada.periodo == periodo)
        .group_by(Opcion.contenido)
    ).all()

    lista_final = []
    for row in resultados:
        opcion_texto = row.contenido
        cantidad = row.cantidad
        porcentaje = (cantidad / total_respuestas) * 100
        lista_final.append({"opcion_id": opcion_texto, "porcentaje": round(porcentaje, 2)})

    return lista_final