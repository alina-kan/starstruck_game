from flask import Flask, jsonify, request
from database import get_db, init_db
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins="http://localhost:5173")

init_db()

# gallery unlocks table
@app.get("/api/gallery")
def get_gallery_unlocks():
    conn = get_db()
    rows = conn.execute("SELECT * FROM gallery_unlocks").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.post("/api/gallery/unlock")
def unlock_cg():
    data = request.json
    cg_key = data.get("cg_key")

    conn = get_db()
    conn.execute(
        "UPDATE gallery_unlocks SET unlocked = 1 WHERE cg_key = ?",
        (cg_key,)
    )
    conn.commit()
    conn.close()

    return jsonify({"status": "ok"})


# Saves table functions
@app.post("/api/save")
def save_progress():
    data = request.json
    #lets us know what's actually being saved here
    print("SAVE PAYLOAD:", data)

    user_id = data["user_id"]
    save_slot = data["save_slot"]
    scene_id = data["scene_id"]
    line_id = data["line_id"]
    nickname = data.get("nickname")
    pronouns = data.get("pronouns")
    affection = data.get("affection")

    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO saves (user_id, save_slot, scene_id, line_id, nickname, pronouns, save_time, affection)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
        ON CONFLICT(user_id, save_slot) DO UPDATE SET
            scene_id = excluded.scene_id,
            line_id = excluded.line_id,
            nickname = excluded.nickname,
            pronouns = excluded.pronouns,
            save_time = CURRENT_TIMESTAMP,
            affection = excluded.affection
    """, (user_id, save_slot, scene_id, line_id, nickname, pronouns, affection))

    conn.commit()
    conn.close()
    return jsonify({"status": "saved"})


# load save from Continue menu
@app.get("/api/continue/<int:user_id>")
def continue_game(user_id):
    conn = get_db()
    row = conn.execute("""
        SELECT *
        FROM saves
        WHERE user_id = ?
        ORDER BY save_time DESC
        LIMIT 1
    """, (user_id,)).fetchone()
    conn.close()

    if row is None:
        return jsonify({"error": "No saves found"}), 404

    return jsonify(dict(row))


# load all saves for continue
@app.get("/api/saves")
def get_saves():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, user_id, save_slot, scene_id, line_id, nickname, pronouns, save_time, affection
        FROM saves
        ORDER BY user_id ASC, save_slot ASC
    """)

    rows = cursor.fetchall()

    saves = []
    for row in rows:
        saves.append({
            "id": row["id"],
            "user_id": row["user_id"],
            "save_slot": row["save_slot"],
            "scene_id": row["scene_id"],
            "line_id": row["line_id"],
            "nickname": row["nickname"],
            "pronouns": row["pronouns"],
            "save_time": row["save_time"],
            "affection": row["affection"]
        })

    return jsonify(saves)

#lets us delete save files 
@app.delete("/api/saves/<int:user_id>/<int:slot>")
def delete_save(user_id, slot):
    conn = get_db()
    conn.execute("""
        DELETE FROM saves
        WHERE user_id = ? AND save_slot = ?
    """, (user_id, slot))
    conn.commit()
    return {"message": "deleted"}

if __name__ == "__main__":
    app.run(debug=True)
