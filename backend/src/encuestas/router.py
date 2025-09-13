from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.encuestas import schemas, services

router = APIRouter(prefix="/encuestas", tags=["encuestas"])

# Rutas para encuestas
