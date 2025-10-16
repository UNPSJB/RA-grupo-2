# backend/src/informes_sinteticos/exceptions.py
from src.informe_catedra.constants import ErrorCode
from src.exceptions import NotFound
class InformeNoEncontrado(NotFound):
    DETAIL = ErrorCode.INFORME_NO_ENCONTRADO
class DocenteMateriaNoEncontrada(NotFound):
    DETAIL = ErrorCode.DOCENTE_MATERIA_NO_ENCONTRADO
class InformeYaExiste(Exception):
    DETAIL = ErrorCode.INFORME_YA_EXISTE
class InformeContenidoInvalido (Exception):
    DETAIL = ErrorCode.INFORME_INVALIDO

