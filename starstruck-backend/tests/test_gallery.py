import json
from app import get_db


def test_gallery_initially_empty(client):
    res = client.get("/api/gallery")
    assert res.status_code == 200
    data = json.loads(res.data)
    assert data == []


def test_unlock_new_image(client):
    res = client.put("/api/gallery/unlock/theron_intro")
    assert res.status_code == 200

    with client.application.app_context():
        conn = get_db()
        row = conn.execute("SELECT * FROM gallery WHERE image_name='theron_intro'").fetchone()
        assert row is not None
        assert row["unlocked"] == 1


def test_unlock_existing_image_updates_flag(client):
    # Insert locked image
    with client.application.app_context():
        conn = get_db()
        conn.execute("INSERT INTO gallery (image_name, unlocked) VALUES ('theron_intro', 0)")
        conn.commit()

    client.put("/api/gallery/unlock/CG2")

    with client.application.app_context():
        conn = get_db()
        row = conn.execute("SELECT * FROM gallery WHERE image_name='theron_intro'").fetchone()
        assert row["unlocked"] == 1
