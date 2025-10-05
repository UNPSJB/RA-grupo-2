from src.encuestaCompletada.constants import ErrorCode
from src.exceptions import NotFound

class EncuestaCompletadaNoEncontrada(NotFound):
    DETAIL = ErrorCode.ENCUESTA_COMPLETADA_NO_ENCONTRADA