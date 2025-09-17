import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI
from src.database import engine
from src.models import Base, ModeloBase

from src.docentes.models import Docente
from src.materias.models import Materia

# importamos los routers desde nuestros modulos
from src.docentes.router import router as docentes_router
from src.materias.router import router as materias_router

from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

ENV = os.getenv("ENV")
ROOT_PATH = os.getenv(f"ROOT_PATH_{ENV.upper()}")


@asynccontextmanager
async def db_creation_lifespan(app: FastAPI):
    ModeloBase.metadata.create_all(bind=engine)
    yield


app = FastAPI(root_path=ROOT_PATH, lifespan=db_creation_lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# asociamos los routers a nuestra app
app.include_router(docentes_router)
app.include_router(materias_router)