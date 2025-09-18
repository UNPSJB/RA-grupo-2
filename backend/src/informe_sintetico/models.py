# backend/src/informes_sinteticos/models.py
from sqlalchemy import Column, Integer, String, Text
from backend.src.database import Base

class InformeSintetico(Base):
    __tablename__ = "informes_sinteticos"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(255), nullable=False)
    contenido = Column(Text, nullable=False)
    fecha = Column(String(50))
