from src.encuestas.constants import ErrorCode
from src.exceptions import NotFound

class EncuestaNoEncontrada(NotFound):
    DETAIL = ErrorCode.ENCUESTA_NO_ENCONTRADA
