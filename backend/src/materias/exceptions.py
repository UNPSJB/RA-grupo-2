from typing import List
from src.materias.constantes import ErrorCode
from src.exceptions import NotFound, BadRequest

class MateriaNoEncontrada(NotFound):
    DETAIL = ErrorCode.MATERIA_NO_ENCONTRADA