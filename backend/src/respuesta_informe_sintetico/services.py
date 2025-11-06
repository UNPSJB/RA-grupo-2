from typing import List
from sqlalchemy.orm import Session
from src.respuesta_informe_sintetico import schemas, models

def _crear_respuesta_db(informe_completado_id: int, pregunta_id: int, texto_respuesta: str, materia_id: int) -> models.RespuestaInformeSintetico:
    return models.RespuestaInformeSintetico(
        informe_completado_id=informe_completado_id,
        pregunta_id=pregunta_id,
        texto_respuesta=texto_respuesta,
        materia_id=materia_id
    )
    
def guardar_respuesta(db: Session, respuesta: schemas.RespuestaInformeSinteticoCreate) -> models.RespuestaInformeSintetico:
    respuesta_db = _crear_respuesta_db(
        respuesta.informe_completado_id,  
        respuesta.pregunta_id,
        respuesta.texto_respuesta,
        respuesta.materia_id
    )
    db.add(respuesta_db)
    db.commit()
    db.refresh(respuesta_db)
    
    return respuesta_db
def guardar_respuestas_lote(db: Session, respuestas: List[schemas.RespuestaInformeSinteticoCreate]) -> List[models.RespuestaInformeSintetico]:
    respuestas_db = []
    
    for respuesta_data in respuestas:
        respuesta_db = _crear_respuesta_db(
            respuesta_data.informe_completado_id,  
            respuesta_data.pregunta_id,
            respuesta_data.texto_respuesta,
            respuesta_data.materia_id
        )
        db.add(respuesta_db)
        respuestas_db.append(respuesta_db)
    db.commit()
    
    for respuesta in respuestas_db:
        db.refresh(respuesta)
    
    return respuestas_db