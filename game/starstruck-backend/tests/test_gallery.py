import json
from app import get_db


def test_gallery_initially_empty(client):
    res = client.get("/api/gallery")
    assert res.status_code == 200
    data = json.loads(res.data)
    assert data == []


def test_unlock_new_image(client):
    """Unlock an image → expect it to appear unlocked."""
    res = client.put("/api/gallery/unlock/CG1")
    assert res.status_code == 200

    with client.application.app_context():
        conn = get_db()
        row = conn.execute("SELECT * FROM gallery WHERE image_name='CG1'").fetchone()
        assert row is not None
        assert row["unlocked"] == 1


def test_unlock_existing_image_updates_flag(client):
    """Unlock an existing image → unlocked should stay 1."""
    # Insert locked image
    with client.application.app_context():
        conn = get_db()
        conn.execute("INSERT INTO gallery (image_name, unlocked) VALUES ('CG2', 0)")
        conn.commit()

    client.put("/api/gallery/unlock/CG2")

    with client.application.app_context():
        conn = get_db()
        row = conn.execute("SELECT * FROM gallery WHERE image_name='CG2'").fetchone()
        assert row["unlocked"] == 1


def test_gallery_list_after_unlocks(client):
    """Unlock multiple images → list should return them."""
    client.put("/api/gallery/unlock/CG_A")
    client.put("/api/gallery/unlock/CG_B")

    res = client.get("/api/gallery")
    data = json.loads(res.data)

    names = {row["image_name"] for row in data}
    assert "CG_A" in names
    assert "CG_B" in names
