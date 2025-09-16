from src.cursadasMaterias.constants import ErrorCode
from src.exceptions import NotFound
from typing import List

class MateriaNoEncontrada(NotFound):
    DETAIL = ErrorCode.CURSADA_NO_ENCONTRADA

class PeriodoInvalido(ValueError):
    def __init__(self, posibles_tipos: List[str]):
        posibles_tipos = ", ".join(posibles_tipos)
        message = f"{ErrorCode.PERIODO_INVALIDO} {posibles_tipos}."
        super().__init__(message)
