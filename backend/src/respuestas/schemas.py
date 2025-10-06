from pydantic import BaseModel

class RespuestaBase(BaseModel):
    pregunta_id: int
    opcion_id: int

class RespuestaCreate(RespuestaBase):
    encuesta_completada_id: int

class Respuesta(RespuestaBase):
    id: int
    encuesta_completada_id: int

model_config = {"from_attributes": True}

class RespuestaCreateEnEncuesta(RespuestaBase):
    pass