from src.respuesta_informe_sintetico.constants import ErrorCode
from src.exceptions import NotFound 

class RespuestaInformeSinteticoNoEncontrada(NotFound):
    DETAIL = ErrorCode.RESPUESTA_SINTETICO_NO_ENCONTRADA