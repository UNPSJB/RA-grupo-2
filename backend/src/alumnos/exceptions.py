from src.alumnos.constants import ErrorCode
from src.exceptions import NotFound

class AlumnoNoEncontrado(NotFound):
    DETAIL = ErrorCode.ALUMNO_NO_ENCONTRADO
