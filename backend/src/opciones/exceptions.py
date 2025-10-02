from src.opciones.constants import ErrorCode
from src.exceptions import NotFound

class OpcionNoEncontrada(NotFound):
    DETAIL = ErrorCode.OPCION_NO_ENCONTRADA