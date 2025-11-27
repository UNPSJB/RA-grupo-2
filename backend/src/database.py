# REEMPLAZA TODO EL CONTENIDO DE backend/src/database.py CON ESTO:

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
# 1. Añadimos declarative_base a las importaciones
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

# Tu configuración de engine original
engine = create_engine(os.getenv("DB_URL"), connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# --- NUEVO: Definimos la Base para los modelos ---
# Esto es lo que faltaba y lo que los modelos de 'users' y 'auth' intentan importar.
Base = declarative_base()
# -------------------------------------------------

# Dependency (Tu función get_db original)
def get_db():
    db = SessionLocal()
    # Para usar restricciones de FK en SQLite, debemos habilitar la siguiente opción:
    db.execute(text("PRAGMA foreign_keys = ON"))
    try:
        yield db
    finally:
        db.close()