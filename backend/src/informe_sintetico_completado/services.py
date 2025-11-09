from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select
from src.informe_sintetico_completado import models, schemas
from src.respuesta_informe_sintetico import services as respuestas_services 
from typing import List, Optional
from src.materias.models import Materia
from src.materias import schemas as materias_schemas
from src.informe_catedra_completado.models import InformeCatedraCompletado
from src.respuestasInforme.models import RespuestaInforme
from src.preguntas.models import Pregunta
from src.asociaciones.models import materia_carrera
from src.asociaciones.models import Periodo
from src.asociaciones.docente_materia.models import DocenteMateria
from src.docentes.models import Docente

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

    materias: list[Materia] = db.scalars(
        select(Materia)
        .join(materia_carrera, Materia.id == materia_carrera.c.materia_id)
        .where(
            Materia.departamento_id == id_dpto,
            materia_carrera.c.carrera_id == id_carrera
        )
    ).all()

    elementos: List[schemas.InformacionGeneral] = []


    for materia in materias:
        informe_completado: InformeCatedraCompletado = db.scalars(
            select(InformeCatedraCompletado)
            .where(
                InformeCatedraCompletado.anio == anio,
                InformeCatedraCompletado.periodo == periodo,
                InformeCatedraCompletado.docente_materia.has(materia_id=materia.id)
            )
        ).first()
        
        if not informe_completado:
            continue

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


def get_elementos_pregunta2C(db: Session, id_dpto: int, id_carrera: int, anio: int, periodo: str) -> List[schemas.TablaPregunta2CItem]:
    materias: list[schemas.Materia] = db.scalars(
        select(Materia)
        .join(materia_carrera, Materia.id == materia_carrera.c.materia_id)
        .where(
            Materia.departamento_id == id_dpto,
            materia_carrera.c.carrera_id == id_carrera
        )
    ).all()

    elementos: List[schemas.TablaPregunta2CItem] = []

    for materia in materias:
        informe_completado: InformeCatedraCompletado=db.scalars(
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

        r_ap_e: RespuestaInforme = next((r for r in informe_completado.respuestas_informe
                if r.pregunta.enunciado.strip() == "Aspectos positivos: Proceso Enseñanza"), None)
        
        r_ap_a: RespuestaInforme = next((r for r in informe_completado.respuestas_informe
                if r.pregunta.enunciado.strip() == "Aspectos positivos: Proceso de aprendizaje"), None)
        
        r_o_e: RespuestaInforme = next((r for r in informe_completado.respuestas_informe
                if r.pregunta.enunciado.strip() == "Obstáculos: Proceso Enseñanza"), None)
        
        r_o_a: RespuestaInforme = next((r for r in informe_completado.respuestas_informe
                if r.pregunta.enunciado.strip() == "Obstáculos: Proceso de aprendizaje"), None)
        
        r_est: RespuestaInforme = next((r for r in informe_completado.respuestas_informe
                if r.pregunta.enunciado.strip() == "Estrategias a implementar"), None)
        
        
        respuestas_obj = schemas.RespuestasSeccion2C(
            aspectos_positivos_ensenanza = r_ap_e.texto_respuesta if r_ap_e else None,
            aspectos_positivos_aprendizaje = r_ap_a.texto_respuesta if r_ap_a else None,
            obstaculos_ensenanza = r_o_e.texto_respuesta if r_o_e else None,
            obstaculos_aprendizaje = r_o_a.texto_respuesta if r_o_a else None,
            estrategias = r_est.texto_respuesta if r_est else None,
        )

        elemento = schemas.TablaPregunta2CItem(
            materia = materia,
            respuestas = respuestas_obj
        )
        elementos.append(elemento)
    
    return elementos

def obtener_temas_desarrollados(
    db: Session, id_dpto: int, id_carrera: int, anio: int, periodo: str
) -> List[schemas.TemasDesarrolladosItem]:
    
    materias: list[Materia] = db.scalars(
        select(Materia)
        .join(materia_carrera, Materia.id == materia_carrera.c.materia_id)
        .where(
            Materia.departamento_id == id_dpto,
            materia_carrera.c.carrera_id == id_carrera
        )
    ).all()
    
    elementos: List[schemas.TemasDesarrolladosItem] = []
    
    for materia in materias:
        informe_completado: InformeCatedraCompletado = db.scalars(
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

        respuesta_porcentaje: RespuestaInforme = next(
            (r for r in informe_completado.respuestas_informe 
             if r.pregunta.enunciado == "Cantidad de temas desarrollados %"), 
            None
        )
        respuesta_estrategias: RespuestaInforme = next(
            (r for r in informe_completado.respuestas_informe 
             if r.pregunta.enunciado == "Estrategias"), 
            None
        )

        elemento = schemas.TemasDesarrolladosItem(
            materia = materia,
            porcentaje_texto = respuesta_porcentaje.texto_respuesta if respuesta_porcentaje else None,
            estrategias_texto = respuesta_estrategias.texto_respuesta if respuesta_estrategias else None
        )
        
        elementos.append(elemento)
        
    return elementos
def get_actividades_docentes(
    db: Session, id_dpto: int, id_carrera: int, anio: int, periodo: str
) -> List[schemas.ActividadesPorMateriaItem]:

    materias: list[Materia] = db.scalars(
        select(Materia)
        .join(materia_carrera, Materia.id == materia_carrera.c.materia_id)
        .where(
            Materia.departamento_id == id_dpto,
            materia_carrera.c.carrera_id == id_carrera
        )
    ).all()

    elementos: List[schemas.ActividadesPorMateriaItem] = []
    roles_a_buscar = ["Profesor", "JTP", "Auxiliar", "Auxiliar de segunda"]

    for materia in materias:
        informe_completado: InformeCatedraCompletado = db.scalars(
            select(InformeCatedraCompletado)
            .join(DocenteMateria, InformeCatedraCompletado.docente_materia_id == DocenteMateria.id)
            .where(
                InformeCatedraCompletado.anio == anio,
                InformeCatedraCompletado.periodo == Periodo(periodo),
                DocenteMateria.materia_id == materia.id
            )
            .options(
                selectinload(InformeCatedraCompletado.respuestas_informe)
                    .selectinload(RespuestaInforme.pregunta)
            )
        ).first()

        if not informe_completado:
            continue

        lista_docentes_actividades: List[schemas.DocenteConActividades] = []

        def find_response_text(enunciado: str) -> Optional[str]:
            r = next(
                (r for r in informe_completado.respuestas_informe
                    if r.pregunta.enunciado.strip() == enunciado.strip()),
                None
            )
            return r.texto_respuesta if r and r.texto_respuesta else None

        for rol in roles_a_buscar:
            nombre_docente = find_response_text(f"Nombre - {rol}")
            if not nombre_docente:
                continue

            actividades_docente = schemas.DocenteActividades(
                capacitacion=find_response_text(f"Capacitación - {rol}"),
                investigacion=find_response_text(f"Investigación - {rol}"),
                extension=find_response_text(f"Extensión - {rol}"),
                gestion=find_response_text(f"Gestión - {rol}"),
                observaciones=find_response_text(f"Observaciones - {rol}")
            )

            lista_docentes_actividades.append(
                schemas.DocenteConActividades(
                    nombre_docente=nombre_docente,
                    rol_docente=rol,
                    actividades=actividades_docente
                )
            )

        if not lista_docentes_actividades:
            docente_relacion = None

            docente_materia_rel = db.scalars(
                select(DocenteMateria)
                .options(selectinload(DocenteMateria.docente))
                .where(DocenteMateria.id == informe_completado.docente_materia_id)
            ).first()
            docente_relacion = docente_materia_rel.docente if docente_materia_rel else None

            if docente_relacion:
                docente_fallback = schemas.DocenteConActividades(
                    nombre_docente=f"{docente_relacion.apellido}, {docente_relacion.nombre}",
                    rol_docente="Profesor",
                    actividades=schemas.DocenteActividades()
                )
                lista_docentes_actividades.append(docente_fallback)

        elemento = schemas.ActividadesPorMateriaItem(
            materia=materia,
            docentes=lista_docentes_actividades
        )
        elementos.append(elemento)

    return elementos
def get_bibliografia_equipamiento(db: Session, id_dpto: int, id_carrera: int, anio: int, periodo: str) -> List[schemas.EquipamientoBibliografia]:

    pregunta_equipamiento = db.scalars(select(Pregunta.id).where(Pregunta.enunciado.ilike("equipamiento"))).first()
    pregunta_bibliografia = db.scalars(select(Pregunta.id).where(Pregunta.enunciado.ilike("bibliografia"))).first()
    
    if not pregunta_equipamiento or not pregunta_bibliografia:
        return []
    
    ID_EQUIPAMIENTO = pregunta_equipamiento
    ID_BIBLIOGRAFIA = pregunta_bibliografia

    materias: list[Materia] = db.scalars(
        select(Materia)
        .join(materia_carrera, Materia.id == materia_carrera.c.materia_id)
        .where(
            Materia.departamento_id == id_dpto,
            materia_carrera.c.carrera_id == id_carrera
        )
    ).all()
    
    elementos: List[schemas.EquipamientoBibliografia] = [] 
    
    for materia in materias:

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
        ).all() 

        if not informes_completados:
            continue

        respuestas_biblio = set()
        respuestas_equip = set()
        
        for informe in informes_completados:
            
            r_bibliografia: RespuestaInforme = next((r for r in informe.respuestas_informe
                    if r.pregunta_id == ID_BIBLIOGRAFIA and r.texto_respuesta and r.texto_respuesta.strip() != '-'), None) 
            
            r_equipamiento: RespuestaInforme = next((r for r in informe.respuestas_informe
                    if r.pregunta_id == ID_EQUIPAMIENTO and r.texto_respuesta and r.texto_respuesta.strip() != '-'), None) 
            
            if r_bibliografia:
                respuestas_biblio.add(r_bibliografia.texto_respuesta.strip())
            
            if r_equipamiento:
                respuestas_equip.add(r_equipamiento.texto_respuesta.strip())
        
        bibliografia_consolidada = "; ".join(respuestas_biblio) if respuestas_biblio else "-"
        equipamiento_consolidado = "; ".join(respuestas_equip) if respuestas_equip else "-"

        elemento = schemas.EquipamientoBibliografia(
            materia = materia,
            bibliografia = bibliografia_consolidada,
            equipamiento = equipamiento_consolidado
        )
        elementos.append(elemento)
    
    return elementos