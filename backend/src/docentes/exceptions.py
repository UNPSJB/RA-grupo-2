from typing import List
from src.docentes.constantes import ErrorCode
from src.exceptions import NotFound, BadRequest

class DocenteNoEncontrado(NotFound):
    DETAIL = ErrorCode.DOCENTE_NO_ENCONTRADO
