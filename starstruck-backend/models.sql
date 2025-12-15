CREATE TABLE IF NOT EXISTS saves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    save_slot INTEGER NOT NULL,
    scene_id INTEGER NOT NULL,
    line_id INTEGER NOT NULL,
    nickname TEXT,
    pronouns TEXT,
    save_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    affection INTEGER DEFAULT 0,
    UNIQUE(user_id, save_slot)
);

CREATE TABLE IF NOT EXISTS gallery_unlocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cg_key TEXT UNIQUE,
    unlocked INTEGER NOT NULL DEFAULT 0
);
