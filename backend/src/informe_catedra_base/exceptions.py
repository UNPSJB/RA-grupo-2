from src.informe_catedra_base.constants import ErrorCode
from src.exceptions import NotFound
class InformeCatedraBaseNoEncontrado(NotFound):
    DETAIL = ErrorCode.INFORME_NO_ENCONTRADO