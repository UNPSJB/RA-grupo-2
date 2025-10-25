from src.informe_catedra_completado.constants import ErrorCode
from src.exceptions import NotFound, BadRequest

class InformeCompletadoNoEncontrado(NotFound):
    DETAIL = ErrorCode.INFORME_COMPLETADO_NO_ENCONTRADO

class InformeCompletadoYaExiste(BadRequest):
    DETAIL = ErrorCode.INFORME_COMPLETADO_YA_EXISTE

class InformeContenidoInvalido(BadRequest):
    DETAIL = ErrorCode.INFORME_INVALIDO

class DocenteMateriaNoEncontrada(NotFound):
    DETAIL = ErrorCode.DOCENTE_MATERIA_NO_ENCONTRADO