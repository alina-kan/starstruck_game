import sqlite3

DB_PATH = "db.sqlite3"

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    with open("models.sql", "r") as f:
        conn.executescript(f.read())
    conn.commit()
    conn.close()
