#### Descripción

Este proyecto contiene un ejemplo de la estructura recomendada para nuevos proyectos que utilicen FastAPI en el backend. 

Se sugiere mantener la estructura de archivos (basada en [fastapi-best-practices](https://github.com/zhanymkanov/fastapi-best-practices)), adaptándola al dominio que corresponda. Esto es, creando nuevos módulos que contengan mínimamente los siguientes elementos:

*  `constants.py`
*  `exceptions.py`
*  `models.py`
*  `router.py`
*  `schemas.py`
*  `services.py`

Si se lo desea, añadir tests para dichos módulos debiera seguir la misma estructura que los disponibles en la carpeta `tests`, con las adaptaciones que se consideren necesarias.

#### ¿Cómo lo ejecuto?

1. Instalar dependencias dentro de un entorno virtual con: `pip install -r requirements.txt`
2. Crea una copia del archivo `.env.template` con el nombre `.env` y reemplaza los valores de las variables de entorno que creas necesarias.
3. Asumiendo que estamos en el directorio `src/`, iniciar el proyecto ejecutando: `fastapi dev main.py`
4. Cuando el proyecto esté listo, abrir http://localhost:8000/docs para probar la API de manera interactiva.

Opcionalmente:
1. Asumiendo que estamos en la raíz del proyecto, ejecutar los tests con: `python -m pytest tests/`

#### ¿Cómo lo uso?

1. Descargate una copia de este proyecto.
2. Abrelo y copia los archivos a la carpeta de tu nuevo proyecto.
3. Verifica que puedes ejecutar el proyecto tal como está. Ver sección: ¿Cómo lo ejecuto?
4. Ya puedes comenzar a trabajar en tu proyecto.

**Importante**: 
* Evitar copiar el directorio `.git/` del repositorio original.
* Al trabajar en nuevos dominios, los módulos y archivos de ejemplo (personas, mascotas) ya no son necesarios y pueden ser eliminados junto con cualquier referencia a ellos dentro de `src/` y `tests/`.
* Por defecto el proyecto utiliza el motor de base de datos `sqlite` por lo que los datos de la app vivirán dentro del archivo `db.sqlite3` a menos que se renombre y/o se decida utilizar otro motor de base de datos.
* Los tests han sido configurados para ejecutarse utilizando una base de datos en memoria por lo que no existe un archivo que contenga sus datos. 