from src.preguntas.constants import ErrorCode
from src.exceptions import NotFound

class PreguntaNoEncontrada(NotFound):
    DETAIL = ErrorCode.PREGUNTA_NO_ENCONTRADA