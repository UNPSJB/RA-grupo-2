from src.materias.constants import ErrorCode
from src.exceptions import NotFound

class MateriaNoEncontrada(NotFound):
    DETAIL = ErrorCode.MATERIA_NO_ENCONTRADA
