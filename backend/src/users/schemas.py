from re import S
from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel): 
    username: str
    email: EmailStr
    role_id: Optional[int] = None
    role_name: str

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

    model_config = {"extra": "forbid"}


class User(UserBase):
    id: int
    role_name: str
    alumno_id: Optional[int] = None
    docente_id: Optional[int] = None
    departamento_id: Optional[int] = None
    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    model_config = {"extra": "ignore"}


class UserDelete(BaseModel):
    id: int
    msg: str

