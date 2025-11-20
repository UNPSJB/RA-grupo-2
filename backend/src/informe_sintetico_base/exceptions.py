from src.informe_sintetico_base.constants import ErrorCode
from src.exceptions import NotFound 

class InformeSinteticoBaseNoEncontrado(NotFound):
    DETAIL = ErrorCode.INFORME_SINTETICO_NO_ENCONTRADO