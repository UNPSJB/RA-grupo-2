import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI
from src.database import engine
from src.models import Base, ModeloBase

# importamos los routers desde nuestros modulos
from src.carreras.router import router as carreras_router
from src.departamentos.router import router as departamentos_router
from src.informe_sintetico.router import router as informes_router
from src.alumnos.router import router as alumnos_router
from src.docentes.router import router as docentes_router
from src.materias.router import router as materias_router
from src.encuestas.router import router as encuestas_router
from src.opciones.router import router as opciones_router
from src.preguntas.router import router as preguntas_router
from src.categorias.router import router as categorias_router
from src.respuestas.router import router as respuestas_router
from src.encuestaCompletada.router import router as encuesta_completada_router
from src.opciones.router import router as opciones_router
from src.preguntas.router import router as preguntas_router
from src.categorias.router import router as categorias_router
#from src.informe_catedra.router import router as informes_catedra_router
from src.informe_catedra_base.router  import router as informes_catedra_base_router
from src.informe_catedra_completado.router  import router as informes_catedra_completado_router
from src.respuestasInforme.router import router as respuestas_informe_router

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

app.include_router(departamentos_router)
app.include_router(carreras_router)
app.include_router(alumnos_router)
app.include_router(docentes_router)
app.include_router(materias_router)
app.include_router(encuestas_router)
app.include_router(informes_router)
app.include_router(opciones_router)
app.include_router(preguntas_router)
app.include_router(categorias_router)
app.include_router(respuestas_router)
app.include_router(encuesta_completada_router)
#app.include_router(informes_catedra_router)
app.include_router(informes_catedra_base_router)
app.include_router(informes_catedra_completado_router)
app.include_router(respuestas_informe_router)