import json
from app import get_db


def test_create_new_save_slot(client):
    """Create a new save → expect it to appear in DB."""
    res = client.put("/api/saves/1/1", json={
        "scene_id": 1,
        "line_id": 10,
        "nickname": "Roxanne",
        "pronouns": "she/her"
    })

    assert res.status_code == 200

    with client.application.app_context():
        conn = get_db()
        row = conn.execute("SELECT * FROM saves WHERE user_id=1 AND save_slot=1").fetchone()
        assert row["scene_id"] == 1
        assert row["line_id"] == 10
        assert row["nickname"] == "Roxanne"


def test_overwrite_existing_save(client):
    """Save once → overwrite same slot → DB should update."""
    client.put("/api/saves/1/1", json={
        "scene_id": 1,
        "line_id": 5,
        "nickname": "Alex",
        "pronouns": "he/him"
    })

    client.put("/api/saves/1/1", json={
        "scene_id": 2,
        "line_id": 20,
        "nickname": "Roxanne",
        "pronouns": "she/her"
    })

    with client.application.app_context():
        conn = get_db()
        row = conn.execute("SELECT * FROM saves WHERE user_id=1 AND save_slot=1").fetchone()
        assert row["scene_id"] == 2
        assert row["line_id"] == 20
        assert row["nickname"] == "Roxanne"


def test_load_save_file(client):
    """Ensure GET /api/saves returns the saved row."""
    # Insert save
    client.put("/api/saves/1/2", json={
        "scene_id": 3,
        "line_id": 7,
        "nickname": "MC",
        "pronouns": "they/them"
    })

    res = client.get("/api/saves")
    data = json.loads(res.data)

    assert any(slot["save_slot"] == 2 for slot in data)
    loaded = [s for s in data if s["save_slot"] == 2][0]

    assert loaded["scene_id"] == 3
    assert loaded["line_id"] == 7
    assert loaded["nickname"] == "MC"
