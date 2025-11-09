from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select
from src.informe_sintetico_completado import models, schemas
from src.respuesta_informe_sintetico import services as respuestas_services 
from typing import List
from src.materias.models import Materia
from src.materias import schemas as materias_schemas
from src.informe_catedra_completado.models import InformeCatedraCompletado
from src.respuestasInforme.models import RespuestaInforme
from src.preguntas.models import Pregunta
from src.asociaciones.models import materia_carrera
from src.asociaciones.models import Periodo


def get_informes_completados(db: Session):
    return db.query(models.InformeSinteticoCompletado).all()

def get_informe_completado(db: Session, informe_id: int):
    return db.query(models.InformeSinteticoCompletado).filter(models.InformeSinteticoCompletado.id == informe_id).first()

def create_informe_completado(db: Session, informe_data: schemas.InformeSinteticoCompletadoCreate) -> models.InformeSinteticoCompletado:
    informe_dict = informe_data.model_dump(exclude={"respuestas"})
    respuestas_data = informe_data.respuestas
    db_informe = models.InformeSinteticoCompletado(**informe_dict)
    db.add(db_informe)
    db.flush() 
    if respuestas_data:
        respuestas_a_guardar = []
        for respuesta in respuestas_data:
            respuesta_create = respuestas_services.schemas.RespuestaInformeSinteticoCreate(
                **respuesta.model_dump(),
                informe_completado_id=db_informe.id 
            )
            respuestas_a_guardar.append(respuesta_create)
            
        respuestas_services.guardar_respuestas_lote(db, respuestas_a_guardar)
    
    db.commit()
    db.refresh(db_informe)
    return db_informe

def get_elementos_pregunta2B(db: Session, id_dpto: int, id_carrera: int, anio: int, periodo: str)-> List[schemas.TablaPregunta2BItem]:
    materias: list[schemas.Materia] = db.scalars(
        select(Materia)
        .join(materia_carrera, Materia.id == materia_carrera.c.materia_id)
        .where(
            Materia.departamento_id == id_dpto,
            materia_carrera.c.carrera_id == id_carrera
        )
    ).all()
    
    elementos: List[schemas.TablaPregunta2BItem] = []
    for materia in materias:
        informe_completado:InformeCatedraCompletado=db.scalars(
            select(InformeCatedraCompletado)
            .where(
                InformeCatedraCompletado.anio == anio,
                InformeCatedraCompletado.periodo == periodo,
                InformeCatedraCompletado.docente_materia.has(materia_id = materia.id)
            )
            .options(
                selectinload(InformeCatedraCompletado.respuestas_informe)
                    .selectinload(RespuestaInforme.pregunta)   
        )
        ).first()

        if not informe_completado:
            continue

        b: RespuestaInforme = next((r for r in informe_completado.respuestas_informe 
              if r.pregunta.enunciado == "B: Comunicación y desarrollo de la asignatura"), None)

        c: RespuestaInforme = next((r for r in informe_completado.respuestas_informe
                if r.pregunta.enunciado == "C: Metodología"), None)

        d: RespuestaInforme = next((r for r in informe_completado.respuestas_informe
                if r.pregunta.enunciado == "D: Evaluación"), None)

        et: RespuestaInforme = next((r for r in informe_completado.respuestas_informe
                if r.pregunta.enunciado == "E(TEORIA): Actuación de los miembros de la Cátedra "), None)

        ep: RespuestaInforme = next((r for r in informe_completado.respuestas_informe
                if r.pregunta.enunciado == "E(PRACTICA): Actuación de los miembros de la Cátedra "), None)

        elemento = schemas.TablaPregunta2BItem(
            materia = materia,
            encuesta_B = b.texto_respuesta if b else "-",
            encuesta_C = c.texto_respuesta if c else "-",
            encuesta_D = d.texto_respuesta if d else "-",
            encuesta_ET = et.texto_respuesta if et else "-",
            encuesta_EP = ep.texto_respuesta if ep else "-",
            juicio_valor = ""
        )
        elementos.append(elemento)
    return elementos


def get_elementos_pregunta2(db: Session, id_dpto: int, id_carrera: int, anio: int, periodo: str) -> List[schemas.TablaPregunta2Item]:
    materias: list[schemas.Materia] = db.scalars(
        select(Materia)
        .join(materia_carrera, Materia.id == materia_carrera.c.materia_id)
        .where(
            Materia.departamento_id == id_dpto,
            materia_carrera.c.carrera_id == id_carrera
        )
    ).all()
    
    elementos: List[schemas.TablaPregunta2Item] = [] 
    
    for materia in materias:
        informe_completado:InformeCatedraCompletado=db.scalars(
            select(InformeCatedraCompletado)
            .where(
                InformeCatedraCompletado.anio == anio,
                InformeCatedraCompletado.periodo == Periodo(periodo), 
                InformeCatedraCompletado.docente_materia.has(materia_id = materia.id)
            )
            .options(
                selectinload(InformeCatedraCompletado.respuestas_informe)
                    .selectinload(RespuestaInforme.pregunta)   
            )
        ).first()

        if not informe_completado:
            continue

        r_horas: RespuestaInforme = next((r for r in informe_completado.respuestas_informe
                if r.pregunta.enunciado.strip() == "Clases teóricas %"), None)
        
        r_practica: RespuestaInforme = next((r for r in informe_completado.respuestas_informe
                if r.pregunta.enunciado.strip() == "Clases prácticas %"), None)
        
        r_justificacion: RespuestaInforme = next((r for r in informe_completado.respuestas_informe 
                if r.pregunta.enunciado.strip() == "Justificación"), None)

        elemento = schemas.TablaPregunta2Item(
            materia = materia,
            porcentaje_teoricas = r_horas.texto_respuesta if r_horas and r_horas.texto_respuesta else "-",
            porcentaje_practicas = r_practica.texto_respuesta if r_practica and r_practica.texto_respuesta else "-",
            justificacion = r_justificacion.texto_respuesta if r_justificacion else None
        )
        elementos.append(elemento)
    
    return elementos

def obtener_informacion_general(
    db: Session, id_dpto: int, id_carrera: int, anio: int, periodo: str
) -> List[schemas.InformacionGeneral]:
    """
    Obtiene la información general de cada materia (sin agrupar ni sumar),
    para un departamento, carrera, año y período específicos.
    """

    # 1️⃣ Buscar las materias del departamento y carrera
    materias: list[Materia] = db.scalars(
        select(Materia)
        .join(materia_carrera, Materia.id == materia_carrera.c.materia_id)
        .where(
            Materia.departamento_id == id_dpto,
            materia_carrera.c.carrera_id == id_carrera
        )
    ).all()

    elementos: List[schemas.InformacionGeneral] = []

    # 2️⃣ Buscar informe completado de cada materia
    for materia in materias:
        informe_completado: InformeCatedraCompletado = db.scalars(
            select(InformeCatedraCompletado)
            .where(
                InformeCatedraCompletado.anio == anio,
                InformeCatedraCompletado.periodo == periodo,
                InformeCatedraCompletado.docente_materia.has(materia_id=materia.id)
            )
        ).first()

        # Si no tiene informe, continuar
        if not informe_completado:
            continue

        # 3️⃣ Crear el objeto con la materia y sus datos
        elemento = schemas.InformacionGeneral(
            materia=materia,
            codigo=materia.matricula,
            nombre=materia.nombre,
            cantidad_alumnos=informe_completado.cantidadAlumnos or 0,
            cantidad_comisiones_teoricas=informe_completado.cantidadComisionesTeoricas or 0,
            cantidad_comisiones_practicas=informe_completado.cantidadComisionesPracticas or 0,
        )

        elementos.append(elemento)

    return elementos

# Services.py (Nueva versión de la función get_necesidades_bibliografia_equipamiento)

def get_bibliografia_equipamiento(db: Session, id_dpto: int, id_carrera: int, anio: int, periodo: str) -> List[schemas.EquipamientoBibliografia]:
    """
    Obtiene y CONSOLIDA las respuestas de 'bibliografia' y 'equipamiento' 
    de TODOS los informes de cátedra para una materia, departamento, carrera, año y período.
    """
    
    # 1️⃣ Obtener IDs de Preguntas (Se mantiene para robustez)
    pregunta_equipamiento = db.scalars(select(Pregunta.id).where(Pregunta.enunciado.ilike("equipamiento"))).first()
    pregunta_bibliografia = db.scalars(select(Pregunta.id).where(Pregunta.enunciado.ilike("bibliografia"))).first()
    
    if not pregunta_equipamiento or not pregunta_bibliografia:
        return []
    
    ID_EQUIPAMIENTO = pregunta_equipamiento
    ID_BIBLIOGRAFIA = pregunta_bibliografia
    
    # 2️⃣ Buscar las materias
    materias: list[Materia] = db.scalars(
        select(Materia)
        .join(materia_carrera, Materia.id == materia_carrera.c.materia_id)
        .where(
            Materia.departamento_id == id_dpto,
            materia_carrera.c.carrera_id == id_carrera
        )
    ).all()
    
    elementos: List[schemas.EquipamientoBibliografia] = [] 
    
    # 3️⃣ Procesar por materia
    for materia in materias:
        # 🌟 CAMBIO CLAVE: Obtener TODOS los informes completados para esta materia y período
        informes_completados: List[InformeCatedraCompletado] = db.scalars(
            select(InformeCatedraCompletado)
            .where(
                InformeCatedraCompletado.anio == anio,
                InformeCatedraCompletado.periodo == Periodo(periodo), 
                InformeCatedraCompletado.docente_materia.has(materia_id = materia.id)
            )
            .options(
                selectinload(InformeCatedraCompletado.respuestas_informe)
                    .selectinload(RespuestaInforme.pregunta)   
            )
        ).all() # ⬅️ CAMBIADO DE .first() A .all()

        if not informes_completados:
            continue

        respuestas_biblio = set()
        respuestas_equip = set()
        
        # 4️⃣ Iterar sobre TODOS los informes y extraer las respuestas
        for informe in informes_completados:
            
            # Buscar la respuesta de bibliografía en este informe
            r_bibliografia: RespuestaInforme = next((r for r in informe.respuestas_informe
                    if r.pregunta_id == ID_BIBLIOGRAFIA and r.texto_respuesta and r.texto_respuesta.strip() != '-'), None) 
            
            # Buscar la respuesta de equipamiento en este informe
            r_equipamiento: RespuestaInforme = next((r for r in informe.respuestas_informe
                    if r.pregunta_id == ID_EQUIPAMIENTO and r.texto_respuesta and r.texto_respuesta.strip() != '-'), None) 
            
            if r_bibliografia:
                respuestas_biblio.add(r_bibliografia.texto_respuesta.strip())
            
            if r_equipamiento:
                respuestas_equip.add(r_equipamiento.texto_respuesta.strip())
        separador = "\n\n--- RESPUESTA SEPARADA ---\n\n"
        
        # Consolida todas las respuestas únicas
        bibliografia_consolidada = separador.join(respuestas_biblio) if respuestas_biblio else "-"
        equipamiento_consolidado = separador.join(respuestas_equip) if respuestas_equip else "-"
        
        # 6️⃣ Mapear al nuevo Schema
        elemento = schemas.EquipamientoBibliografia(
            materia = materia,
            bibliografia = bibliografia_consolidada,
            equipamiento = equipamiento_consolidado
        )
        elementos.append(elemento)
    
    return elementos