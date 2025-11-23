#!/usr/bin/env python3
# seed_data.py
# Ejecutar en la misma carpeta donde está tu archivo SQLite (mi-db-sqlite.db)
# python seed_data.py

import sqlite3
from datetime import datetime

DB_PATH = "mi-db-sqlite.db"  # ajustá si tu archivo tiene otro nombre/location
ANIO = 2025

# Nombres argentinos para docentes y alumnos
DOCENTES = [
    ("María", "González"),
    ("Juan", "Pérez"),
    ("Lucía", "Rodríguez"),
    ("Martín", "Fernández")
]

ALUMNOS_1 = [("Sofía","García"),("Mateo","López"),("Valentina","Martínez"),("Thiago","Gómez"),("Mía","Díaz")]
ALUMNOS_2 = [("Benjamín","Silva"),("Agustina","Herrera"),("Tomás","Ruiz"),("Abril","Torres"),("Gonzalo","Rossi")]
ALUMNOS_3 = [("Isabella","Romero"),("Bruno","Sosa"),("Julia","Morales"),("Facundo","Navarro"),("Camila","Molina")]
ALUMNOS_4 = [("Diego","Vega"),("Antonella","Castro")]
ALUMNOS_5 = [("Federico","Ortega"),("Paula","Iglesias")]

# Materias: (codigo, nombre, periodo)
# Periodo: 'PRIMER_CUATRI' or 'SEGUNDO_CUATRI'
MATERIAS = [
    # 1er año
    ("IF001","Elementos de informática","PRIMER_CUATRI"),
    ("MA045","Algebra","PRIMER_CUATRI"),
    ("IF002","Expresión de Problemas y algoritmos","PRIMER_CUATRI"),
    ("IF003","Algorítmica y Programación I","SEGUNDO_CUATRI"),
    ("MA048","Análisis Matemático - S","SEGUNDO_CUATRI"),
    ("MA008","Elementos de Lógica y Matemática Discreta","SEGUNDO_CUATRI"),

    # 2º año
    ("IF004","Sistemas y Organizaciones","PRIMER_CUATRI"),
    ("IF005","Arquitectura de Computadoras","PRIMER_CUATRI"),
    ("IF006","Algorítmica y Programación II","PRIMER_CUATRI"),
    ("IF007","Bases de Datos I","SEGUNDO_CUATRI"),
    ("MA006","Estadística","SEGUNDO_CUATRI"),
    ("IF008","Programación Orientada a Objetos","SEGUNDO_CUATRI"),
    ("IF038","Introducción a la Concurrencia","SEGUNDO_CUATRI"),

    # 3er año
    ("IF009","Laboratorio de Programación y Lenguajes","PRIMER_CUATRI"),
    ("IF040","Ingeniería de Software I - T","PRIMER_CUATRI"),
    ("IF037","Sistemas Operativos","PRIMER_CUATRI"),
    ("IF012","Desarrollo de Software","SEGUNDO_CUATRI"),
    ("IF013","Fundamentos Teóricos de Informática","SEGUNDO_CUATRI"),
    ("IF043","Ingeniería de Software II - T","SEGUNDO_CUATRI"),

    # 4º año
    ("IF019","Redes y Transmisión de Datos","PRIMER_CUATRI"),
    ("IF044","Base de Datos II","PRIMER_CUATRI"),
    ("IF020","Paradigmas y Lenguajes de Programación","PRIMER_CUATRI"),
    ("IF046","Administración de Redes y Seguridad","SEGUNDO_CUATRI"),
    ("IF047","Ingeniería de Software III","SEGUNDO_CUATRI"),
    ("IF016","Aspectos Legales y Profesionales","SEGUNDO_CUATRI"),
    ("IF022","Sistemas Distribuidos","SEGUNDO_CUATRI"),

    # 5º año
    ("IF049","Administración de Proyectos","PRIMER_CUATRI"),
    ("IF050","Aplicaciones Web","PRIMER_CUATRI"),
    ("IF017","Taller de Nuevas Tecnologías","PRIMER_CUATRI"),
    ("IF027","Modelos y Simulación","PRIMER_CUATRI"),
    ("IF053","Planificación y Gestión de Sistemas de Información","SEGUNDO_CUATRI"),
    ("IF054","Sistemas de Soporte para la Toma de Decisiones","SEGUNDO_CUATRI"),
]

def next_id(cursor, table):
    cursor.execute(f"SELECT MAX(id) FROM {table}")
    r = cursor.fetchone()[0]
    return (r or 0) + 1

def insert_materias(conn):
    cur = conn.cursor()
    materia_rows = []
    for code, name, periodo in MATERIAS:
        # encuesta_id=1, departamento_id=1, informe_catedra_id NULL
        materia_rows.append((name, code, 1, 1, None, periodo))
    # Insert one by one with ID autogenerado por script (consecutive)
    cur.execute("BEGIN")
    for i, (name, code, encuesta, depto, inf, periodo) in enumerate(materia_rows, start=1):
        # We'll set explicit id = i
        cur.execute(
            "INSERT INTO materias (id, nombre, matricula, encuesta_id, departamento_id, informe_catedra_id) VALUES (?, ?, ?, ?, ?, ?)",
            (i, name, code, encuesta, depto, inf)
        )
    conn.commit()
    return len(materia_rows)

def insert_materia_carrera(conn, materia_count):
    cur = conn.cursor()
    cur.execute("BEGIN")
    mc_id = next_id(cur, "materia_carrera")
    # all materias -> carrera_id = 2
    for m_id in range(1, materia_count+1):
        cur.execute("INSERT INTO materia_carrera (id, materia_id, carrera_id) VALUES (?, ?, ?)", (mc_id, m_id, 2))
        mc_id += 1
    # additionally link 1º,2º,3º year materias to carrera_id = 1 except codes IF038, IF013, IF043
    codes_exclude = {"IF038","IF013","IF043"}
    # find materia ids by matricula
    cur.execute("SELECT id, matricula FROM materias")
    rows = cur.fetchall()
    for row in rows:
        mid, matricula = row
        # determine year by matricula mapping in our MATERIAS list above
        if matricula in [m[0] for m in MATERIAS]:
            # find index to know which year
            idx = [m[0] for m in MATERIAS].index(matricula)
            # indices 0..5 -> 1er año, 6..12 -> 2do, 13..18 -> 3ro
            if idx <= 5 or (6 <= idx <= 12) or (13 <= idx <= 18):
                if matricula not in codes_exclude:
                    cur.execute("INSERT INTO materia_carrera (id, materia_id, carrera_id) VALUES (?, ?, ?)", (mc_id, mid, 1))
                    mc_id += 1
    conn.commit()

def insert_docentes(conn):
    cur = conn.cursor()
    cur.execute("BEGIN")
    for i, (nombre, apellido) in enumerate(DOCENTES, start=1):
        cur.execute("INSERT INTO docentes (id, nombre, apellido) VALUES (?, ?, ?)", (i, nombre, apellido))
    conn.commit()
    return len(DOCENTES)

def assign_docente_materia(conn, materia_count, docentes_count):
    # We will assign 4 materias a cada docente, mixing PRIMER/SEGUNDO
    cur = conn.cursor()
    cur.execute("BEGIN")
    dm_id = next_id(cur, "docente_materia")
    # simple distribution: take materia ids sequentially
    m = 1
    for docente_id in range(1, docentes_count+1):
        for _ in range(4):
            if m > materia_count:
                m = 1
            # determine periodo of the materia
            cur.execute("SELECT matricula FROM materias WHERE id = ?", (m,))
            matricula = cur.fetchone()[0]
            # read period from our in-memory list
            periodo = None
            for code, name, p in MATERIAS:
                if code == matricula:
                    periodo = p
                    break
            periodo = periodo or "PRIMER_CUATRI"
            cur.execute(
                "INSERT INTO docente_materia (id, docente_id, materia_id, anio, periodo) VALUES (?, ?, ?, ?, ?)",
                (dm_id, docente_id, m, ANIO, periodo)
            )
            dm_id += 1
            m += 1
    conn.commit()

def insert_alumnos(conn):
    cur = conn.cursor()
    cur.execute("BEGIN")
    all_alumnos = ALUMNOS_1 + ALUMNOS_2 + ALUMNOS_3 + ALUMNOS_4 + ALUMNOS_5
    start_id = next_id(cur, "alumnos")
    for idx, (nombre, apellido) in enumerate(all_alumnos, start=start_id):
        cuil = f"20-{idx:08d}-{(idx%9)+1}"
        usuario = f"user{idx}"
        clave = f"pass{idx}"
        cur.execute("INSERT INTO alumnos (id, \"CUIL\", nombre, apellido, usuario, clave) VALUES (?, ?, ?, ?, ?, ?)",
                    (idx, cuil, nombre, apellido, usuario, clave))
    conn.commit()
    return start_id, len(all_alumnos)

def enroll_alumnos(conn, alumnos_start_id, total_alumnos):
    cur = conn.cursor()
    cur.execute("BEGIN")
    am_id = next_id(cur, "alumno_materia")
    # Helper: materias ids by year:
    # 1er año: indices 0..5 -> ids 1..6
    materias_1 = list(range(1, 7))
    # 2do año: ids 7..13 (we included IF038 as 13)
    materias_2 = list(range(7, 14))
    # 3ro año: ids 14..19
    materias_3 = list(range(14, 20))
    # 4to: ids 20..26
    materias_4 = list(range(20, 27))
    # 5to: ids 27..32
    materias_5 = list(range(27, 33))
    # assign:
    # alumnos_1: first 5 (relative positions 0..4)
    # mapping absolute ids:
    a1_ids = list(range(alumnos_start_id, alumnos_start_id + 5))
    a2_ids = list(range(alumnos_start_id + 5, alumnos_start_id + 10))
    a3_ids = list(range(alumnos_start_id + 10, alumnos_start_id + 15))
    a4_ids = list(range(alumnos_start_id + 15, alumnos_start_id + 17))
    a5_ids = list(range(alumnos_start_id + 17, alumnos_start_id + 19))

    # helper to get period from materia id
    def get_period(m_id):
        cur.execute("SELECT matricula FROM materias WHERE id = ?", (m_id,))
        matricula = cur.fetchone()[0]
        for code, name, p in MATERIAS:
            if code == matricula:
                return p
        return "PRIMER_CUATRI"

    for aid in a1_ids:
        for m in materias_1:
            periodo = get_period(m)
            cur.execute("INSERT INTO alumno_materia (id, alumno_id, materia_id, nota_cursada, anio, periodo) VALUES (?, ?, ?, ?, ?, ?)",
                        (am_id, aid, m, None, ANIO, periodo))
            am_id += 1
    for aid in a2_ids:
        for m in materias_2:
            periodo = get_period(m)
            cur.execute("INSERT INTO alumno_materia (id, alumno_id, materia_id, nota_cursada, anio, periodo) VALUES (?, ?, ?, ?, ?, ?)",
                        (am_id, aid, m, None, ANIO, periodo))
            am_id += 1
    for aid in a3_ids:
        for m in materias_3:
            periodo = get_period(m)
            cur.execute("INSERT INTO alumno_materia (id, alumno_id, materia_id, nota_cursada, anio, periodo) VALUES (?, ?, ?, ?, ?, ?)",
                        (am_id, aid, m, None, ANIO, periodo))
            am_id += 1
    for aid in a4_ids:
        # two materias each for 4th year students (first two of materias_4)
        for m in materias_4[:2]:
            periodo = get_period(m)
            cur.execute("INSERT INTO alumno_materia (id, alumno_id, materia_id, nota_cursada, anio, periodo) VALUES (?, ?, ?, ?, ?, ?)",
                        (am_id, aid, m, None, ANIO, periodo))
            am_id += 1
    for aid in a5_ids:
        # two materias each for 5th year students (first two of materias_5)
        for m in materias_5[:2]:
            periodo = get_period(m)
            cur.execute("INSERT INTO alumno_materia (id, alumno_id, materia_id, nota_cursada, anio, periodo) VALUES (?, ?, ?, ?, ?, ?)",
                        (am_id, aid, m, None, ANIO, periodo))
            am_id += 1

    conn.commit()

def main():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    cur = conn.cursor()

    try:
        print("Insertando materias...")
        materia_count = insert_materias(conn)
        print(f"Insertadas {materia_count} materias.")

        print("Insertando materia_carrera...")
        insert_materia_carrera(conn, materia_count)
        print("materia_carrera creada.")

        print("Insertando docentes...")
        docentes_count = insert_docentes(conn)
        print(f"Insertados {docentes_count} docentes.")

        print("Asignando docente_materia...")
        assign_docente_materia(conn, materia_count, docentes_count)
        print("docente_materia asignado.")

        print("Insertando alumnos...")
        alumnos_start_id, total_alumnos = insert_alumnos(conn)
        print(f"Insertados {total_alumnos} alumnos, empezando en id {alumnos_start_id}.")

        print("Inscribiendo alumnos en materias...")
        enroll_alumnos(conn, alumnos_start_id, total_alumnos)
        print("Inscripciones creadas.")

        print("Todo OK.")
    except Exception as e:
        conn.rollback()
        print("Error:", e)
    finally:
        conn.close()

if __name__ == "__main__":
    main()
