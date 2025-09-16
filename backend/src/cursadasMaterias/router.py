from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.cursadasMaterias import schemas, services

router = APIRouter(prefix="/cursadasMaterias", tags=["cursadasMaterias"])

# Rutas para cursadas
