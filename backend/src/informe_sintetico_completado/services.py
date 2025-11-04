from sqlalchemy.orm import Session
from src.informe_sintetico_completado import models, schemas
from src.respuesta_informe_sintetico import services as respuestas_services 
from typing import List


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