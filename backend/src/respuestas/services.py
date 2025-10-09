from typing import List
from sqlalchemy.orm import Session
from src.respuestas import schemas, models

def _crear_respuesta_db(encuesta_completada_id: int, pregunta_id: int, opcion_id: int | None = None, texto_respuesta: str | None = None) -> models.Respuesta:
    return models.Respuesta(
        encuesta_completada_id=encuesta_completada_id,
        pregunta_id=pregunta_id,
        opcion_id=opcion_id,
        texto_respuesta=texto_respuesta
    )


def guardar_respuesta(db: Session, respuesta: schemas.RespuestaCreate) -> schemas.Respuesta:
    respuesta_db = _crear_respuesta_db(
        respuesta.encuesta_completada_id,  
        respuesta.pregunta_id,
        respuesta.opcion_id,
        respuesta.texto_respuesta
    )
    
    db.add(respuesta_db)
    db.commit()
    db.refresh(respuesta_db)
    
    return respuesta_db


def guardar_respuestas_lote(db: Session, encuesta_completada_id: int,  respuestas: List[schemas.RespuestaCreateEnEncuesta]) -> List[schemas.Respuesta]:
    respuestas_db = []
    
    for respuesta_data in respuestas:
        respuesta_db = _crear_respuesta_db(
            encuesta_completada_id,  
            respuesta_data.pregunta_id,
            respuesta_data.opcion_id,
            respuesta_data.texto_respuesta
        )
        db.add(respuesta_db)
        respuestas_db.append(respuesta_db)
    
    db.commit()
    
    for respuesta in respuestas_db:
        db.refresh(respuesta)
    
    return respuestas_db