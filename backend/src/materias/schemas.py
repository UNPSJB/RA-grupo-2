from pydantic import BaseModel, field_validator
from typing import List
from typing import Optional, List
class MateriaBase(BaseModel):
    nombre: str
    matricula: str
    docente_id: Optional[int] = None  # Opcional para creación
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

       model_config = {"from_attributes": True}
       

