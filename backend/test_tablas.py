# test_tablas.py
from src.database import engine
from sqlalchemy import inspect

print("🔍 Verificando tablas en la base de datos...")

# Crear inspector
inspector = inspect(engine)

# Obtener todas las tablas
tablas = inspector.get_table_names()
print(f"📊 Tablas en la BD: {tablas}")

# Verificar si existe la tabla de informes
if 'informes_sinteticos' in tablas:
    print("✅ Tabla 'informes_sinteticos' EXISTE en la BD")
    
    # Verificar columnas
    columnas = inspector.get_columns('informes_sinteticos')
    print("📋 Columnas de la tabla:")
    for col in columnas:
        print(f"   - {col['name']} ({col['type']})")
        
else:
    print("❌ Tabla 'informes_sinteticos' NO EXISTE en la BD")