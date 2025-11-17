from pydantic import BaseModel, field_serializer
from typing import List
from typing import Optional, List
class MateriaBase(BaseModel):
    nombre: str
    matricula: str
    docente_id: Optional[int] = None  
    #muestra una base de como deberia ser los datos del docente
    model_config= {
        "json_schema_extra":{
            "example":{
                "nombre": "Álgebra",
                "matricula": "MA405",
            }
        }
    }


class Materia(MateriaBase):
    id: int
    departamento_id: int
    model_config = {"from_attributes": True}
       

class MateriasAsignarFormularios(BaseModel):
    materia_ids: List[int]
    encuesta_id: Optional[int] = None
    informe_catedra_id: Optional[int] = None