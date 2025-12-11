import os
import tempfile
import pytest
from app import app, get_db


@pytest.fixture
def client():
    db_fd, temp_db = tempfile.mkstemp()
    app.config["DATABASE"] = temp_db
    app.config["TESTING"] = True

    # Reinitialize DB
    with app.app_context():
        conn = get_db()
        conn.executescript("""
            DROP TABLE IF EXISTS saves;
            CREATE TABLE saves (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                save_slot INTEGER,
                scene_id INTEGER,
                line_id INTEGER,
                nickname TEXT,
                pronouns TEXT,
                save_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            DROP TABLE IF EXISTS gallery;
            CREATE TABLE gallery (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                image_name TEXT,
                unlocked INTEGER DEFAULT 0
            );
        """)
        conn.commit()

    yield app.test_client()

    os.close(db_fd)
    os.unlink(temp_db)
