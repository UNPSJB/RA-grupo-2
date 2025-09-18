from pydantic import BaseModel, field_validator
from typing import List

class DocenteBase(BaseModel):
    nombre: str
    apellido: str
    #muestra una base de como deberia ser los datos del docente
    model_config= {
        "json_schema_extra":{
            "example":{
                "nombre": "Maria",
                "apellido": "Nuñez",
            }
        }
    }

class Docente(DocenteBase):
       id: int

       model_config = {"from_attributes": True}
       